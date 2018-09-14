"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const includes = require("lodash.includes");
const cloneDeep = require("lodash.clonedeep");
const isEmpty = require("lodash.isempty");
const resource_selection_optimizer_1 = require("./resource-selection-optimizer");
const ddfcsv_error_1 = require("./ddfcsv-error");
const ddf_query_validator_1 = require("ddf-query-validator");
const Papa = require("papaparse");
const isValidNumeric = val => typeof val !== 'number' && !val ? false : true;
function ddfCsvReader(logger) {
    const internalConcepts = [
        { concept: 'concept', concept_type: 'string', domain: null },
        { concept: 'concept_type', concept_type: 'string', domain: null }
    ];
    const operators = new Map([
        ['$and', (row, predicates) => predicates.every(p => applyFilterRow(row, p))],
        ['$or', (row, predicates) => predicates.some(p => applyFilterRow(row, p))],
        ['$not', (row, predicate) => !applyFilterRow(row, predicate)],
        ['$nor', (row, predicates) => !predicates.some(p => applyFilterRow(row, p))],
        ['$eq', (rowValue, filterValue) => rowValue == filterValue],
        ['$ne', (rowValue, filterValue) => rowValue != filterValue],
        ['$gt', (rowValue, filterValue) => isValidNumeric(rowValue) && rowValue > filterValue],
        ['$gte', (rowValue, filterValue) => isValidNumeric(rowValue) && rowValue >= filterValue],
        ['$lt', (rowValue, filterValue) => isValidNumeric(rowValue) && rowValue < filterValue],
        ['$lte', (rowValue, filterValue) => isValidNumeric(rowValue) && rowValue <= filterValue],
        ['$in', (rowValue, filterValue) => filterValue.has(rowValue)],
        ['$nin', (rowValue, filterValue) => !filterValue.has(rowValue)],
    ]);
    const keyValueLookup = new Map();
    const resourcesLookup = new Map();
    let optimalFilesSet = [];
    function loadDataPackage(baseOptions) {
        return new Promise((resolve, reject) => {
            baseOptions.fileReader.readText(baseOptions.datapackagePath, (err, data) => {
                if (err) {
                    return reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.FILE_READING_ERROR, err, baseOptions.datapackagePath));
                }
                let datapackage;
                try {
                    datapackage = JSON.parse(data);
                    optimalFilesSet = [];
                    buildResourcesLookup(datapackage);
                    buildKeyValueLookup(datapackage);
                }
                catch (parseErr) {
                    return reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.JSON_PARSING_ERROR, parseErr.message, baseOptions.datapackagePath));
                }
                resolve(datapackage);
            });
        });
    }
    async function loadConcepts(queryParam, options) {
        setConceptsLookup(internalConcepts, options);
        const conceptQuery = {
            select: { key: ['concept'], value: ['concept_type', 'domain'] },
            from: 'concepts',
            dataset: queryParam.dataset,
            branch: queryParam.branch,
            commit: queryParam.commit
        };
        let result;
        try {
            const concepts = await queryData(conceptQuery, options);
            buildConceptsLookup(concepts, options);
            result = await reparseConcepts(options);
        }
        catch (error) {
            throw error;
        }
        return result;
    }
    function buildConceptsLookup(concepts, options) {
        const entitySetMembershipConcepts = concepts
            .filter(concept => concept.concept_type === 'entity_set')
            .map(concept => ({
            concept: 'is--' + concept.concept,
            concept_type: 'boolean',
            domain: null
        }));
        concepts = concepts
            .concat(entitySetMembershipConcepts)
            .concat(internalConcepts);
        setConceptsLookup(concepts, options);
    }
    function reparseConcepts({ conceptsLookup }) {
        const parsingFunctions = new Map([
            ['boolean', (str) => str === 'true' || str === 'TRUE'],
            ['measure', (str) => parseFloat(str)]
        ]);
        const resources = getResources(['concept']);
        const resourceUpdates = [...resources].map(resource => {
            return resource.data.then(response => {
                const resourceConcepts = Object.keys(response.data[0]);
                const parsingConcepts = new Map();
                resourceConcepts.forEach(concept => {
                    const type = conceptsLookup.get(concept).concept_type;
                    const fn = parsingFunctions.get(type);
                    if (fn) {
                        parsingConcepts.set(concept, fn);
                    }
                });
                return response.data.forEach(row => {
                    for (const [concept, parseFn] of parsingConcepts) {
                        row[concept] = parseFn(row[concept]);
                    }
                });
            });
        });
        return Promise.all(resourceUpdates);
    }
    function setConceptsLookup(concepts, options) {
        options.conceptsLookup.clear();
        concepts.forEach(row => options.conceptsLookup.set(row.concept, row));
    }
    async function query(queryParam, baseOptions) {
        let data;
        try {
            await ddf_query_validator_1.validateQueryStructure(queryParam, baseOptions);
            await ddf_query_validator_1.extendQueryParamWithDatasetProps(queryParam, baseOptions);
            const datapackage = await loadDataPackage(baseOptions);
            baseOptions.datapackage = datapackage;
            await loadConcepts(queryParam, baseOptions);
            await ddf_query_validator_1.validateQueryDefinitions(queryParam, baseOptions);
            if (ddf_query_validator_1.isSchemaQuery(queryParam)) {
                data = await querySchema(queryParam, { datapackage });
            }
            else {
                const appropriatePlugin = resource_selection_optimizer_1.getAppropriatePlugin(queryParam, baseOptions);
                if (appropriatePlugin) {
                    optimalFilesSet = [];
                    const files = await appropriatePlugin.getRecommendedFilesSet();
                    optimalFilesSet = files;
                }
                data = await queryData(queryParam, baseOptions);
            }
        }
        catch (error) {
            throw error;
        }
        return data;
    }
    function queryData(queryParam, options) {
        const { select: { key = [], value = [] }, from = '', where = {}, join = {}, order_by = [], language } = queryParam;
        const select = { key, value };
        const projection = new Set(select.key.concat(select.value));
        const filterFields = getFilterFields(where).filter(field => !projection.has(field));
        const resourcesPromise = loadResources(select.key, [...select.value, ...filterFields], language, options);
        const joinsPromise = getJoinFilters(join, queryParam, options);
        const entitySetFilterPromise = getEntitySetFilter(select.key, queryParam, options);
        return Promise.all([resourcesPromise, entitySetFilterPromise, joinsPromise])
            .then(([resourceResponses, entitySetFilter, joinFilters]) => {
            const whereResolved = processWhere(where, joinFilters);
            const filter = mergeFilters(entitySetFilter, whereResolved);
            const dataTables = resourceResponses
                .map(response => processResourceResponse(response, select, filterFields, options));
            const queryResult = joinData(select.key, 'overwrite', ...dataTables)
                .filter(row => applyFilterRow(row, filter))
                .map(row => fillMissingValues(row, projection))
                .map(row => projectRow(row, projection));
            orderData(queryResult, order_by);
            return queryResult;
        });
    }
    function orderData(data, orderBy = []) {
        if (orderBy.length === 0) {
            return;
        }
        const orderNormalized = orderBy.map(orderPart => {
            if (typeof orderPart === 'string') {
                return { concept: orderPart, direction: 1 };
            }
            else {
                const concept = Object.keys(orderPart)[0];
                const direction = (orderPart[concept] === 'asc' ? 1 : -1);
                return { concept, direction };
            }
        });
        const n = orderNormalized.length;
        data.sort((a, b) => {
            for (let i = 0; i < n; i++) {
                const order = orderNormalized[i];
                if (a[order.concept] < b[order.concept]) {
                    return -1 * order.direction;
                }
                else if (a[order.concept] > b[order.concept]) {
                    return 1 * order.direction;
                }
            }
            return 0;
        });
    }
    function processWhere(where, joinFilters) {
        const result = {};
        for (const field in where) {
            const fieldValue = where[field];
            if (includes(['$and', '$or', '$nor'], field)) {
                result[field] = fieldValue.map(subFilter => processWhere(subFilter, joinFilters));
            }
            else if (field === '$in' || field === '$nin') {
                result[field] = new Set(fieldValue);
            }
            else if (typeof joinFilters[fieldValue] !== 'undefined') {
                Object.assign(result, joinFilters[fieldValue]);
            }
            else if (typeof fieldValue === 'object') {
                result[field] = processWhere(fieldValue, joinFilters);
            }
            else {
                result[field] = fieldValue;
            }
        }
        return result;
    }
    function mergeFilters(...filters) {
        return filters.reduce((a, b) => {
            a.$and.push(b);
            return a;
        }, { $and: [] });
    }
    function querySchema(queryParam, { datapackage }) {
        const getSchemaFromCollection = collectionPar => {
            return datapackage.ddfSchema[collectionPar].map(({ primaryKey, value }) => ({ key: primaryKey, value }));
        };
        const collection = queryParam.from.split('.')[0];
        if (datapackage.ddfSchema[collection]) {
            return getSchemaFromCollection(collection);
        }
        else if (collection === '*') {
            return Object.keys(datapackage.ddfSchema)
                .map(getSchemaFromCollection)
                .reduce((a, b) => a.concat(b));
        }
        else {
            throwError(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.DDF_ERROR, `No valid collection (${collection}) for schema query`));
        }
    }
    function fillMissingValues(row, projection) {
        for (const field of projection) {
            if (typeof row[field] === 'undefined') {
                row[field] = null;
            }
        }
        return row;
    }
    function applyFilterRow(row, filter) {
        return Object.keys(filter).every(filterKey => {
            const operator = operators.get(filterKey);
            if (operator) {
                return operator(row, filter[filterKey]);
            }
            else if (typeof filter[filterKey] !== 'object') {
                return operators.get('$eq')(row[filterKey], filter[filterKey]);
            }
            else {
                return applyFilterRow(row[filterKey], filter[filterKey]);
            }
        });
    }
    function getJoinFilters(join, queryParam, options) {
        return Promise.all(Object.keys(join).map(joinID => getJoinFilter(joinID, join[joinID], queryParam, options)))
            .then(results => results.reduce(mergeObjects, {}));
    }
    function mergeObjects(a, b) {
        return Object.assign(a, b);
    }
    function getJoinFilter(joinID, join, queryParam, options) {
        if (options.conceptsLookup.get(join.key).concept_type === 'time') {
            return Promise.resolve({ [joinID]: join.where });
        }
        else {
            return query({
                select: { key: [join.key] },
                where: join.where,
                from: options.conceptsLookup.has(join.key) ? 'entities' : 'concepts',
                dataset: queryParam.dataset,
                branch: queryParam.branch,
                commit: queryParam.commit
            }, Object.assign({ joinID }, cloneDeep(options)))
                .then(result => ({
                [joinID]: {
                    [join.key]: {
                        $in: new Set(result.map(row => row[join.key]))
                    }
                }
            }));
        }
    }
    function getFilterFields(filter) {
        const fields = [];
        for (const field in filter) {
            if (includes(['$and', '$or', '$not', '$nor'], field)) {
                filter[field].map(getFilterFields).forEach(subFields => fields.push(...subFields));
            }
            else {
                fields.push(field);
            }
        }
        return fields;
    }
    function filterConceptsByType(conceptTypes, queryKey, options) {
        const conceptStrings = queryKey || Array.from(options.conceptsLookup.keys());
        const concepts = [];
        for (const conceptString of conceptStrings) {
            const concept = options.conceptsLookup.get(conceptString);
            if (includes(conceptTypes, concept.concept_type)) {
                concepts.push(concept);
            }
        }
        return concepts;
    }
    function getEntityConceptRenameMap(queryKey, resourceKey, options) {
        const resourceKeySet = new Set(resourceKey);
        const entityConceptTypes = ['entity_set', 'entity_domain'];
        const queryEntityConcepts = filterConceptsByType(entityConceptTypes, queryKey, options);
        if (queryEntityConcepts.length === 0) {
            return new Map();
        }
        const allEntityConcepts = filterConceptsByType(entityConceptTypes, null, options);
        return queryEntityConcepts
            .map(concept => allEntityConcepts
            .filter(lookupConcept => {
            if (concept.concept_type === 'entity_set') {
                return resourceKeySet.has(lookupConcept.concept) &&
                    lookupConcept.concept !== concept.concept &&
                    (lookupConcept.domain === concept.domain ||
                        lookupConcept.concept === concept.domain);
            }
            else {
                return resourceKeySet.has(lookupConcept.concept) &&
                    lookupConcept.concept !== concept.concept &&
                    lookupConcept.domain === concept.concept;
            }
        })
            .reduce((map, aliasConcept) => map.set(aliasConcept.concept, concept.concept), new Map())).reduce((mapA, mapB) => new Map([...mapA, ...mapB]), new Map());
    }
    function getEntitySetFilter(conceptStrings, queryParam, options) {
        const promises = filterConceptsByType(['entity_set'], conceptStrings, options)
            .map(concept => query({
            select: { key: [concept.domain], value: ['is--' + concept.concept] },
            from: 'entities',
            dataset: queryParam.dataset,
            branch: queryParam.branch,
            commit: queryParam.commit
        }, Object.assign({}, cloneDeep(options)))
            .then(result => ({
            [concept.concept]: {
                $in: new Set(result
                    .filter(row => row['is--' + concept.concept])
                    .map(row => row[concept.domain]))
            }
        })));
        return Promise.all(promises).then(results => {
            return results.reduce((a, b) => Object.assign(a, b), {});
        });
    }
    function getResources(key, value) {
        if (!value || value.length === 0) {
            return new Set([...keyValueLookup
                    .get(createKeyString(key))
                    .values()
            ].reduce((a, b) => a.concat(b)));
        }
        if (Array.isArray(value)) {
            return value
                .map(singleValue => getResources(key, singleValue))
                .reduce((resultSet, resources) => new Set([...resultSet, ...resources]), new Set());
        }
        let oneKeyOneValueResourcesArray = keyValueLookup
            .get(createKeyString(key))
            .get(value);
        if (oneKeyOneValueResourcesArray) {
            oneKeyOneValueResourcesArray = oneKeyOneValueResourcesArray
                .filter(v => isEmpty(optimalFilesSet) || includes(optimalFilesSet, v.path));
        }
        return new Set(oneKeyOneValueResourcesArray);
    }
    function processResourceResponse(response, select, filterFields, options) {
        const resourcePK = response.resource.schema.primaryKey;
        const resourceProjection = new Set([...resourcePK, ...select.value, ...filterFields]);
        const renameMap = getEntityConceptRenameMap(select.key, resourcePK, options);
        return response.data
            .map(row => projectRow(row, resourceProjection))
            .map(row => renameHeaderRow(row, renameMap));
    }
    function loadResources(key, value, language, options) {
        const resources = getResources(key, value);
        return Promise.all([...resources].map(resource => loadResource(resource, language, options)));
    }
    function projectRow(row, projectionSet) {
        const result = {};
        for (const concept in row) {
            if (projectionSet.has(concept)) {
                result[concept] = row[concept];
            }
        }
        return result;
    }
    function renameHeaderRow(row, renameMap) {
        const result = {};
        for (const concept in row) {
            result[renameMap.get(concept) || concept] = row[concept];
        }
        return result;
    }
    function joinData(key, joinMode, ...data) {
        if (data.length === 1) {
            return data[0];
        }
        const canonicalKey = key.slice(0).sort();
        const dataMap = data.reduce((result, dataPar) => {
            dataPar.forEach(row => {
                const keyString = canonicalKey.map(concept => row[concept]).join(',');
                if (result.has(keyString)) {
                    const resultRow = result.get(keyString);
                    joinRow(resultRow, row, joinMode);
                }
                else {
                    result.set(keyString, row);
                }
            });
            return result;
        }, new Map());
        return [...dataMap.values()];
    }
    function joinRow(resultRow, sourceRow, mode) {
        switch (mode) {
            case 'overwrite':
                Object.assign(resultRow, sourceRow);
                break;
            case 'translation':
                for (const concept in sourceRow) {
                    if (sourceRow[concept] !== '') {
                        resultRow[concept] = sourceRow[concept];
                    }
                }
                break;
            case 'overwriteWithError':
                for (const concept in sourceRow) {
                    if (resultRow[concept] !== undefined && resultRow[concept] !== sourceRow[concept]) {
                        const sourceRowStr = JSON.stringify(sourceRow);
                        const resultRowStr = JSON.stringify(resultRow);
                        const errStr = `JOIN Error: two resources have different data for "${concept}": ${sourceRowStr},${resultRowStr}`;
                        throwError(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.DDF_ERROR, errStr));
                    }
                    else {
                        resultRow[concept] = sourceRow[concept];
                    }
                }
                break;
        }
    }
    function throwError(error) {
        const currentLogger = logger || console;
        currentLogger.error(error.message);
        throw error;
    }
    function createKeyString(key, row = false) {
        const canonicalKey = key.slice(0).sort();
        if (!row) {
            return canonicalKey.join(',');
        }
        else {
            return canonicalKey.map(concept => row[concept]).join(',');
        }
    }
    function loadResource(resource, language, options) {
        const filePromises = [];
        if (typeof resource.data === 'undefined') {
            resource.data = loadFile(options.datasetPath + '/' + resource.path, options);
        }
        filePromises.push(resource.data);
        const languageValid = typeof language !== 'undefined' && includes(getLanguages(options), language);
        const languageLoaded = typeof resource.translations[language] !== 'undefined';
        if (languageValid) {
            if (!languageLoaded) {
                const translationPath = `${options.datasetPath}/lang/${language}/${resource.path}`;
                resource.translations[language] = loadFile(translationPath, options).catch(err => Promise.resolve({}));
            }
            filePromises.push(resource.translations[language]);
        }
        return Promise.all(filePromises).then(fileResponses => {
            const filesData = fileResponses.map(resp => resp.data || []);
            const primaryKey = resource.schema.primaryKey;
            const data = joinData(primaryKey, 'translation', ...filesData);
            return { data, resource };
        });
    }
    function getLanguages({ datapackage }) {
        if (!datapackage.translations) {
            return [];
        }
        return datapackage.translations.map(lang => lang.id);
    }
    function loadFile(filePath, options) {
        return new Promise((resolve, reject) => {
            options.fileReader.readText(filePath, (err, data) => {
                if (err) {
                    return reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.FILE_READING_ERROR, err, filePath));
                }
                Papa.parse(data, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: (headerName) => {
                        if (!options.conceptsLookup) {
                            return true;
                        }
                        const concept = options.conceptsLookup.get(headerName) || {};
                        return includes(['boolean', 'measure'], concept.concept_type);
                    },
                    complete: result => resolve(result),
                    error: error => reject(new ddfcsv_error_1.DdfCsvError(ddfcsv_error_1.CSV_PARSING_ERROR, error, filePath))
                });
            });
        });
    }
    function buildResourcesLookup(datapackagePar) {
        if (resourcesLookup.size > 0) {
            return resourcesLookup;
        }
        datapackagePar.resources.forEach(resource => {
            if (!Array.isArray(resource.schema.primaryKey)) {
                resource.schema.primaryKey = [resource.schema.primaryKey];
            }
            resource.translations = {};
            resourcesLookup.set(resource.name, resource);
        });
        return resourcesLookup;
    }
    function buildKeyValueLookup(datapackagePar) {
        if (keyValueLookup.size > 0) {
            return keyValueLookup;
        }
        for (const collection in datapackagePar.ddfSchema) {
            datapackagePar.ddfSchema[collection].map(kvPair => {
                const key = createKeyString(kvPair.primaryKey);
                const resources = kvPair.resources.map(resourceName => resourcesLookup.get(resourceName));
                if (keyValueLookup.has(key)) {
                    keyValueLookup.get(key).set(kvPair.value, resources);
                }
                else {
                    keyValueLookup.set(key, new Map([[kvPair.value, resources]]));
                }
            });
        }
        return keyValueLookup;
    }
    return {
        query
    };
}
exports.ddfCsvReader = ddfCsvReader;
//# sourceMappingURL=ddf-csv.js.map