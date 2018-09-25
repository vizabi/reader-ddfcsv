"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const head = require("lodash.head");
const values = require("lodash.values");
const keys = require("lodash.keys");
const get = require("lodash.get");
const flattenDeep = require("lodash.flattendeep");
const isEmpty = require("lodash.isempty");
const startsWith = require("lodash.startswith");
const includes = require("lodash.includes");
const compact = require("lodash.compact");
const ddfcsv_error_1 = require("../ddfcsv-error");
const ddf_query_validator_1 = require("ddf-query-validator");
const Papa = require('papaparse');
const WHERE_KEYWORD = 'where';
const JOIN_KEYWORD = 'join';
const KEY_IN = '$in';
const KEY_NIN = '$nin';
const KEY_AND = '$and';
const getFirstConditionClause = clause => head(values(clause));
const getFirstKey = obj => head(keys(obj));
const isOneKeyBased = obj => keys(obj).length === 1;
class InClauseUnderConjunction {
    constructor(queryParam, options) {
        this.flow = {};
        this.fileReader = options.fileReader;
        this.datasetPath = options.basePath;
        this.query = queryParam;
        this.datapackage = options.datapackage;
        this.conceptsLookup = options.conceptsLookup;
    }
    isMatched() {
        this.flow.joinObject = get(this.query, JOIN_KEYWORD);
        const relatedFeatures = compact(ddf_query_validator_1.featureDetectors.map(detector => detector(this.query, this.conceptsLookup)));
        return includes(relatedFeatures, ddf_query_validator_1.QueryFeature.WhereClauseBasedOnConjunction) &&
            includes(relatedFeatures, ddf_query_validator_1.QueryFeature.ConjunctionPartFromWhereClauseCorrespondsToJoin);
    }
    async getRecommendedFilesSet() {
        if (this.isMatched()) {
            let result;
            try {
                this.fillResourceToFileHash();
                this.collectProcessableClauses();
                this.collectEntityFilesNames();
                const data = await this.collectEntities();
                this.fillEntityValuesHash(data);
                this.getFilesGroupsQueryClause();
                result = this.getOptimalFilesGroup();
            }
            catch (err) {
                return [];
            }
            return result;
        }
        else {
            throw new ddfcsv_error_1.DdfCsvError(`Plugin "InClauseUnderConjunction" is not matched!`, 'InClauseUnderConjunction plugin');
        }
    }
    fillResourceToFileHash() {
        this.flow.resourceToFile = get(this.datapackage, 'resources', []).reduce((hash, resource) => {
            hash.set(resource.name, resource.path);
            return hash;
        }, new Map());
        return this;
    }
    collectProcessableClauses() {
        const joinKeys = keys(this.flow.joinObject);
        this.flow.processableClauses = [];
        for (const joinKey of joinKeys) {
            const where = get(this.flow.joinObject, `${joinKey}.${WHERE_KEYWORD}`, {});
            if (this.singleAndField(where)) {
                this.flow.processableClauses.push(...flattenDeep(where[KEY_AND].map(el => this.getProcessableClauses(el))));
            }
            else {
                this.flow.processableClauses.push(...this.getProcessableClauses(where));
            }
        }
        return this;
    }
    collectEntityFilesNames() {
        this.flow.entityFilesNames = [];
        this.flow.fileNameToPrimaryKeyHash = new Map();
        for (const schemaResourceRecord of this.datapackage.ddfSchema.entities) {
            for (const clause of this.flow.processableClauses) {
                const primaryKey = getFirstKey(clause);
                if (head(schemaResourceRecord.primaryKey) === primaryKey) {
                    for (const resourceName of schemaResourceRecord.resources) {
                        const file = this.flow.resourceToFile.get(resourceName);
                        this.flow.entityFilesNames.push(file);
                        this.flow.fileNameToPrimaryKeyHash.set(file, primaryKey);
                    }
                }
            }
        }
        return this;
    }
    collectEntities() {
        const self = this;
        const actions = self.flow.entityFilesNames.map(file => new Promise((actResolve, actReject) => {
            self.fileReader.readText(path.join(self.datasetPath, file), (err, text) => {
                if (err) {
                    return actReject(err);
                }
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: result => actResolve({ file, result }),
                    error: error => actReject(error)
                });
            });
        }));
        return Promise.all(actions);
    }
    fillEntityValuesHash(entitiesData) {
        const getSubdomainsFromRecord = record => compact(keys(record)
            .filter(key => startsWith(key, 'is--') && (record[key] === 'TRUE' || record[key] === 'true'))
            .map(key => key.replace(/^is--/, '')));
        this.flow.entityValueToFileHash = new Map();
        this.flow.entityValueToDomainHash = new Map();
        for (const entityFileDescriptor of entitiesData) {
            for (const entityRecord of entityFileDescriptor.result.data) {
                const primaryKeyForThisFile = this.flow.fileNameToPrimaryKeyHash.get(entityFileDescriptor.file);
                const primaryKeyCellValue = entityRecord[primaryKeyForThisFile];
                const domainsForCurrentRecord = [...getSubdomainsFromRecord(entityRecord)];
                if (isEmpty(domainsForCurrentRecord)) {
                    domainsForCurrentRecord.push(primaryKeyForThisFile);
                }
                this.flow.entityValueToDomainHash.set(primaryKeyCellValue, domainsForCurrentRecord);
                this.flow.entityValueToFileHash.set(primaryKeyCellValue, entityFileDescriptor.file);
            }
        }
        return this;
    }
    getFilesGroupsQueryClause() {
        const getEntitiesExcept = (entityValuesToExclude) => {
            const result = [];
            for (const entityKey of this.flow.entityValueToDomainHash.keys()) {
                if (!includes(entityValuesToExclude, entityKey)) {
                    result.push(entityKey);
                }
            }
            return result;
        };
        const filesGroupsByClause = new Map();
        for (const clause of this.flow.processableClauses) {
            const filesGroupByClause = {
                entities: new Set(),
                datapoints: new Set(),
                concepts: new Set()
            };
            const firstConditionClause = getFirstConditionClause(clause);
            const entityValuesFromClause = firstConditionClause[KEY_IN] || getEntitiesExcept(firstConditionClause[KEY_NIN]);
            for (const entityValueFromClause of entityValuesFromClause) {
                filesGroupByClause.entities.add(this.flow.entityValueToFileHash.get(entityValueFromClause));
                const entitiesByQuery = this.flow.entityValueToDomainHash.get(entityValueFromClause);
                for (const entityByQuery of entitiesByQuery) {
                    for (const schemaResourceRecord of this.datapackage.ddfSchema.datapoints) {
                        for (const resourceName of schemaResourceRecord.resources) {
                            if (includes(schemaResourceRecord.primaryKey, entityByQuery)) {
                                filesGroupByClause.datapoints.add(this.flow.resourceToFile.get(resourceName));
                            }
                        }
                    }
                }
            }
            for (const schemaResourceRecord of this.datapackage.ddfSchema.concepts) {
                for (const resourceName of schemaResourceRecord.resources) {
                    filesGroupByClause.concepts.add(this.flow.resourceToFile.get(resourceName));
                }
            }
            filesGroupsByClause.set(clause, filesGroupByClause);
        }
        this.flow.filesGroupsByClause = filesGroupsByClause;
        return this;
    }
    getOptimalFilesGroup() {
        const clauseKeys = this.flow.filesGroupsByClause.keys();
        let appropriateClauseKey;
        let appropriateClauseSize;
        for (const key of clauseKeys) {
            const size = this.flow.filesGroupsByClause.get(key).datapoints.size +
                this.flow.filesGroupsByClause.get(key).entities.size +
                this.flow.filesGroupsByClause.get(key).concepts.size;
            if (!appropriateClauseKey || size < appropriateClauseSize) {
                appropriateClauseKey = key;
                appropriateClauseSize = size;
            }
        }
        if (!this.flow.filesGroupsByClause.get(appropriateClauseKey)) {
            return [];
        }
        return [
            ...Array.from(this.flow.filesGroupsByClause.get(appropriateClauseKey).concepts),
            ...Array.from(this.flow.filesGroupsByClause.get(appropriateClauseKey).entities),
            ...Array.from(this.flow.filesGroupsByClause.get(appropriateClauseKey).datapoints)
        ];
    }
    getProcessableClauses(clause) {
        const result = [];
        const clauseKeys = keys(clause);
        for (const key of clauseKeys) {
            if (!startsWith(key, '$') && isOneKeyBased(clause[key])) {
                const conditionKey = head(keys(clause[key]));
                if (conditionKey === KEY_IN || conditionKey === KEY_NIN) {
                    result.push(clause);
                }
            }
        }
        return result;
    }
    singleAndField(clause) {
        return isOneKeyBased(clause) && !!get(clause, KEY_AND);
    }
}
exports.InClauseUnderConjunction = InClauseUnderConjunction;
//# sourceMappingURL=in-clause-under-conjunction.js.map