import { IReader } from './file-readers/reader';
import {
  CSV_PARSING_ERROR,
  DDF_ERROR,
  DdfCsvError,
  FILE_READING_ERROR,
  JSON_PARSING_ERROR
} from './ddfcsv-error';

const Promise = require('bluebird');
const Papa = require('papaparse');

const isValidNumeric = val => typeof val !== 'number' && !val ? false : true;

export function ddfCsvReader(path: string, fileReader: IReader, logger?) {

  const internalConcepts = [
    {concept: 'concept', concept_type: 'string', domain: null},
    {concept: 'concept_type', concept_type: 'string', domain: null}
  ];

  const operators = new Map([
    /* logical operators */
    ['$and', (row, predicates) => predicates.every(p => applyFilterRow(row, p))],
    ['$or', (row, predicates) => predicates.some(p => applyFilterRow(row, p))],
    ['$not', (row, predicate) => !applyFilterRow(row, predicate)],
    ['$nor', (row, predicates) => !predicates.some(p => applyFilterRow(row, p))],

    /* equality operators */
    ['$eq', (rowValue, filterValue) => rowValue == filterValue],
    ['$ne', (rowValue, filterValue) => rowValue != filterValue],
    ['$gt', (rowValue, filterValue) => isValidNumeric(rowValue) && rowValue > filterValue],
    ['$gte', (rowValue, filterValue) => isValidNumeric(rowValue) && rowValue >= filterValue],
    ['$lt', (rowValue, filterValue) => isValidNumeric(rowValue) && rowValue < filterValue],
    ['$lte', (rowValue, filterValue) => isValidNumeric(rowValue) && rowValue <= filterValue],
    ['$in', (rowValue, filterValue) => filterValue.has(rowValue)],
    ['$nin', (rowValue, filterValue) => !filterValue.has(rowValue)],
  ]);

  const datapackagePath = getDatapackagePath(path);
  const basePath = getBasePath(datapackagePath);
  const datapackagePromise = loadDataPackage(datapackagePath);
  const conceptsPromise = datapackagePromise.then(loadConcepts);

  const keyValueLookup = new Map<string, any>();
  const resourcesLookup = new Map();
  const conceptsLookup = new Map<string, any>();

  let datapackage;

  function getDatapackagePath(pathParam) {
    if (!pathParam.endsWith('datapackage.json')) {
      if (!pathParam.endsWith('/')) {
        pathParam = pathParam + '/';
      }

      pathParam = pathParam + 'datapackage.json';
    }

    return pathParam;
  }

  function getBasePath(datapackagePathParam) {
    const dpPathSplit = datapackagePathParam.split('/');

    dpPathSplit.pop();

    return dpPathSplit.join('/') + '/';
  }

  function loadDataPackage(pathParam) {
    return new Promise((resolve, reject) => {
      fileReader.readText(pathParam, (err, data) => {
        if (err) {
          return reject(new DdfCsvError(FILE_READING_ERROR, err, pathParam));
        }

        try {
          datapackage = JSON.parse(data);
        } catch (parseErr) {
          return reject(new DdfCsvError(JSON_PARSING_ERROR, parseErr, pathParam));
        }

        buildResourcesLookup(datapackage);
        buildKeyValueLookup(datapackage);

        resolve(datapackage);
      });
    });
  }

  function loadConcepts() {
    // start off with internal concepts
    setConceptsLookup(internalConcepts);

    // query concepts
    const conceptQuery = {
      select: {key: ['concept'], value: ['concept_type', 'domain']},
      from: 'concepts'
    };
    // not using query() to circumvent the conceptPromise resolving
    return queryData(conceptQuery)
      .then(buildConceptsLookup)
      // with conceptsLookup built, we can parse other concept properties
      // according to their concept_type
      .then(reparseConcepts);
  }

  function buildConceptsLookup(concepts) {
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

    setConceptsLookup(concepts);

    return conceptsLookup;
  }

  /**
   * Iterates resources for query and applies parsing according to concept_type
   * of headers. Does not take into account join clause.
   * Impure function as it parses data in-place.
   * @return {[type]}       [description]
   */
  function reparseConcepts() {
    const parsingFunctions = new Map<string, Function>([
      ['boolean', (str) => str === 'true' || str === 'TRUE'],
      ['measure', (str) => parseFloat(str)]
    ]);

    const resources = getResources(['concept']);

    const resourceUpdates = [...resources].map(resource => {
      return resource.data.then(response => {

        // first find out which resource concepts need parsing
        const resourceConcepts = Object.keys(response.data[0]);
        const parsingConcepts = new Map<string, Function>();

        resourceConcepts.forEach(concept => {
          const type = conceptsLookup.get(concept).concept_type;
          const fn = parsingFunctions.get(type);

          if (fn) {
            parsingConcepts.set(concept, fn);
          }
        });

        // then parse only those concepts
        return response.data.forEach(row => {
          for (const [concept, parseFn] of parsingConcepts) {
            row[concept] = parseFn(row[concept]);
          }
        });

      });
    });

    return Promise.all(resourceUpdates);
  }

  // can only take single-dimensional key
  function setConceptsLookup(concepts) {
    conceptsLookup.clear();
    concepts.forEach(row => conceptsLookup.set(row.concept, row));
  }

  function query(queryParam) {
    if (isSchemaQuery(queryParam)) {
      return datapackagePromise.then(() => querySchema(queryParam));
    } else {
      return conceptsPromise.then(() => queryData(queryParam));
    }
  }

  function isSchemaQuery(queryParam) {
    const fromClause = queryParam.from || '';

    return fromClause.split('.')[1] === 'schema';
  }

  function queryData(queryParam) {
    const {
      select: {key = [], value = []},
      from = '',
      where = {},
      join = {},
      order_by = [],
      language
    } = queryParam;
    const select = {key, value};

    const projection = new Set(select.key.concat(select.value));
    const filterFields = getFilterFields(where).filter(field => !projection.has(field));
    // load all relevant resources
    const resourcesPromise = loadResources(select.key, [...select.value, ...filterFields], language);
    // list of entities selected from a join clause, later insterted in where clause
    const joinsPromise = getJoinFilters(join);
    // filter which ensures result only includes queried entity sets
    const entitySetFilterPromise = getEntitySetFilter(select.key);

    return Promise.all([resourcesPromise, entitySetFilterPromise, joinsPromise])
      .then(([resourceResponses, entitySetFilter, joinFilters]) => {
        // create filter from where, join filters and entity set filters
        const whereResolved = processWhere(where, joinFilters);
        const filter = mergeFilters(entitySetFilter, whereResolved);

        const dataTables = resourceResponses
        // rename key-columns and remove irrelevant value-columns
          .map(response => processResourceResponse(response, select, filterFields));

        // join (reduce) data to one data table
        const queryResult = joinData(select.key, 'overwrite', ...dataTables)
          .filter(row => applyFilterRow(row, filter))     // apply filters (entity sets and where (including join))
          .map(row => fillMissingValues(row, projection)) // fill any missing values with null values
          .map(row => projectRow(row, projection));       // remove fields used only for filtering

        orderData(queryResult, order_by);

        return queryResult;
      });
  }

  function orderData(data, orderBy = []) {
    if (orderBy.length === 0) {
      return;
    }

    // process ["geo"] or [{"geo": "asc"}] to [{ concept: "geo", direction: 1 }];
    const orderNormalized = orderBy.map(orderPart => {
      if (typeof orderPart === 'string') {
        return {concept: orderPart, direction: 1};
      } else {
        const concept = Object.keys(orderPart)[0];
        const direction = (orderPart[concept] === 'asc' ? 1 : -1);

        return {concept, direction};
      }
    });

    // sort by one or more fields
    const n = orderNormalized.length;

    data.sort((a, b) => {
      for (let i = 0; i < n; i++) {
        const order = orderNormalized[i];

        if (a[order.concept] < b[order.concept]) {
          return -1 * order.direction;
        } else if (a[order.concept] > b[order.concept]) {
          return 1 * order.direction;
        }
      }

      return 0;
    });
  }

  /**
   * Replaces `$join` placeholders with relevant `{ "$in": [...] }` operator.
   * Replaces $in- and $nin-arrays with sets for faster filtering
   * @param  {Object} where     Where clause possibly containing $join placeholders as field values.
   * @param  {Object} joinFilters Collection of lists of entity or time values,
   *         coming from other tables defined in query `join` clause.
   * @return {Object} Where clause with $join placeholders replaced by valid filter statements
   */
  function processWhere(where, joinFilters) {
    const result = {};

    for (const field in where) {
      const fieldValue = where[field];

      if (['$and', '$or', '$nor'].includes(field)) {
        result[field] = fieldValue.map(subFilter => processWhere(subFilter, joinFilters));
      } else if (field === '$in' || field === '$nin') {
        // prepare "$in" fields for optimized lookup
        result[field] = new Set(fieldValue);
      } else if (typeof joinFilters[fieldValue] !== 'undefined') {
        // found a join!
        // not assigning to result[field] because joinFilter can contain $and/$or statements in case of
        // time concept (join-where is directly copied, not executed)
        // otherwise could end up with where: { year: { $and: [{ ... }]}}, which is invalid
        // (no boolean ops inside field objects)
        // in case of entity join, joinFilters contains correct field
        Object.assign(result, joinFilters[fieldValue]);
      } else if (typeof fieldValue === 'object') {
        // catches $not and fields with equality operator-objects
        // { <field>: { "$lt": 1500 }}
        result[field] = processWhere(fieldValue, joinFilters);
      } else {
        // catches rest, being all equality operators except for $in and $nin
        // { "$lt": 1500 }
        result[field] = fieldValue;
      }
    }

    return result;
  }

  function mergeFilters(...filters) {
    return filters.reduce((a, b) => {
      a.$and.push(b);

      return a;
    }, {$and: []});
  }

  function querySchema(queryPar) {
    const getSchemaFromCollection = collectionPar => {
      return datapackage.ddfSchema[collectionPar].map(
        ({primaryKey, value}) => ({key: primaryKey, value})
      );
    };

    const collection = queryPar.from.split('.')[0];

    if (datapackage.ddfSchema[collection]) {
      return getSchemaFromCollection(collection);
    } else if (collection === '*') {
      return Object.keys(datapackage.ddfSchema)
        .map(getSchemaFromCollection)
        .reduce((a, b) => a.concat(b));
    } else {
      throwError(new DdfCsvError(DDF_ERROR, `No valid collection (${collection}) for schema query`));
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
    // implicit $and in filter object handled by .every()
    return Object.keys(filter).every(filterKey => {
      const operator = operators.get(filterKey);

      if (operator) {
        return operator(row, filter[filterKey]);
        // assuming values are primitives not Number/Boolean/String objects
      } else if (typeof filter[filterKey] !== 'object') {
        // { <field>: <value> } is shorthand for { <field>: { $eq: <value> }}
        return operators.get('$eq')(row[filterKey], filter[filterKey]);
      } else {
        // filter[filterKey] is an object and will thus contain
        // an equality operator (no deep objects (like in Mongo) supported)
        return applyFilterRow(row[filterKey], filter[filterKey]);
      }
    });
  }

  function getJoinFilters(join) {
    return Promise.all(Object.keys(join).map(joinID => getJoinFilter(joinID, join[joinID])))
      .then(results => results.reduce(mergeObjects, {}));
  }

  function mergeObjects(a, b) {
    return Object.assign(a, b);
  }

  function getJoinFilter(joinID, join) {
    // assumption: join.key is same as field in where clause
    //  - where: { geo: $geo }, join: { "$geo": { key: geo, where: { ... }}}
    //  - where: { year: $year }, join: { "$year": { key: year, where { ... }}}
    if (conceptsLookup.get(join.key).concept_type === 'time') {
      // time, no query needed as time values are not explicit in the dataSource
      // assumption: there are no time-properties. E.g. data like <year>,population
      return Promise.resolve({[joinID]: join.where});
    } else {
      // entity concept
      return query({select: {key: [join.key]}, where: join.where})
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
      // no support for deeper object structures (mongo style)
      if (['$and', '$or', '$not', '$nor'].includes(field)) {
        filter[field].map(getFilterFields).forEach(subFields => fields.push(...subFields));
      } else {
        fields.push(field);
      }
    }

    return fields;
  }

  /**
   * Filter concepts by type
   * @param  {Array} conceptStrings   Array of concept strings to filter out. Default all concepts.
   * @param  {Array} conceptTypes    Array of concept types to filter out
   * @return {Array}                  Array of concept strings only of given types
   */
  function filterConceptsByType(conceptTypes, conceptStrings = Array.from(conceptsLookup.keys())) {
    const concepts = [];

    for (const conceptString of conceptStrings) {
      const concept = conceptsLookup.get(conceptString);

      if (conceptTypes.includes(concept.concept_type)) {
        concepts.push(concept);
      }
    }

    return concepts;
  }

  /**
   * Find the aliases an entity concept can have
   * @param  {Array} conceptStrings An array of concept strings for which entity aliases
   * are found if they're entity concepts
   * @return {Map}   Map with all aliases as keys and the entity concept as value
   */
  function getEntityConceptRenameMap(queryKey, resourceKey) {
    const resourceKeySet = new Set(resourceKey);
    const entityConceptTypes = ['entity_set', 'entity_domain'];
    const queryEntityConcepts = filterConceptsByType(entityConceptTypes, queryKey);

    if (queryEntityConcepts.length === 0) {
      return new Map();
    }

    const allEntityConcepts = filterConceptsByType(entityConceptTypes);

    return queryEntityConcepts
      .map(concept => allEntityConcepts
        .filter(lookupConcept => {
          if (concept.concept_type === 'entity_set') {
            return resourceKeySet.has(lookupConcept.concept) &&
              lookupConcept.concept !== concept.concept && // not the actual concept
              (
                lookupConcept.domain === concept.domain ||  // other entity sets in entity domain
                lookupConcept.concept === concept.domain   // entity domain of the entity set
              );
          } else {
            // concept_type == "entity_domain"
            return resourceKeySet.has(lookupConcept.concept) &&
              lookupConcept.concept !== concept.concept && // not the actual concept
              lookupConcept.domain === concept.concept;    // entity sets of the entity domain
          }
        })
        .reduce((map, aliasConcept) => map.set(aliasConcept.concept, concept.concept), new Map())
      ).reduce((mapA, mapB) => new Map([...mapA, ...mapB]), new Map());
  }

  /**
   * Get a "$in" filter containing all entities for a entity concept.
   * @param  {Array} conceptStrings Array of concept strings for which entities should be found
   * @return {Array}                Array of filter objects for each entity concept
   */
  function getEntitySetFilter(conceptStrings) {
    const promises = filterConceptsByType(['entity_set'], conceptStrings)
      .map(concept => query({select: {key: [concept.domain], value: ['is--' + concept.concept]}})
        .then(result => ({
          [concept.concept]:
            {
              $in: new Set(
                result
                  .filter(row => row['is--' + concept.concept])
                  .map(row => row[concept.domain])
              )
            }
        }))
      );

    return Promise.all(promises).then(results => {
      return results.reduce((a, b) => Object.assign(a, b), {});
    });
  }

  /**
   * Returns all resources for a certain key value pair or multiple values for one key
   * @param  {Array} key          The key of the requested resources
   * @param  {Array/string} value The value or values found in the requested resources
   * @return {Array}              Array of resource objects
   */
  function getResources(key, value?) {
    // value not given, load all resources for key
    if (!value || value.length === 0) {
      return new Set(
        [...keyValueLookup
          .get(createKeyString(key))
          .values()
        ].reduce((a, b) => a.concat(b))
      );
    }
    // multiple values
    if (Array.isArray(value)) {
      return value
        .map(singleValue => getResources(key, singleValue))
        .reduce((resultSet, resources) => new Set([...resultSet, ...resources]), new Set());
    }
    // one key, one value
    return new Set(
      keyValueLookup
        .get(createKeyString(key))
        .get(value)
    );
  }

  function processResourceResponse(response, select, filterFields) {
    const resourcePK = response.resource.schema.primaryKey;
    // all fields used for select or filters
    const resourceProjection = new Set([...resourcePK, ...select.value, ...filterFields]);
    // rename map to rename relevant entity headers to requested entity concepts
    const renameMap = getEntityConceptRenameMap(select.key, resourcePK);

    // Renaming must happen after projection to prevent ambiguity
    // E.g. a resource with `<geo>,name,region` fields.
    // Assume `region` is an entity set in domain `geo`.
    // { select: { key: ["region"], value: ["name"] } } is queried
    // If one did rename first the file would have headers `<region>,name,region`.
    // This would be invalid and make unambiguous projection impossible.
    // Thus we need to apply projection first with result: `<geo>,name`, then we can rename.
    return response.data
      .map(row => projectRow(row, resourceProjection))	// remove fields not used for select or filter
      .map(row => renameHeaderRow(row, renameMap));    // rename header rows (must happen **after** projection)
  }

  function loadResources(key, value, language) {

    const resources = getResources(key, value);

    return Promise.all([...resources].map(
      resource => loadResource(resource, language)
    ));
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
        } else {
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
        /* Simple alternative without empty value or error handling */
        Object.assign(resultRow, sourceRow);
        break;
      case 'translation':
        // Translation joining ignores empty values
        // and allows different values for strings (= translations)
        for (const concept in sourceRow) {
          if (sourceRow[concept] !== '') {
            resultRow[concept] = sourceRow[concept];
          }
        }
        break;
      case 'overwriteWithError':
        /* Alternative for "overwrite" with JOIN error detection */
        for (const concept in sourceRow) {
          if (resultRow[concept] !== undefined && resultRow[concept] !== sourceRow[concept]) {
            const sourceRowStr = JSON.stringify(sourceRow);
            const resultRowStr = JSON.stringify(resultRow);
            const errStr =
              `JOIN Error: two resources have different data for "${concept}": ${sourceRowStr},${resultRowStr}`;

            throwError(new DdfCsvError(DDF_ERROR, errStr));
          } else {
            resultRow[concept] = sourceRow[concept];
          }
        }
        break;
    }
  }

  function throwError(error: DdfCsvError) {
    const currentLogger = logger || console;

    currentLogger.error(error.message);

    throw error;
  }

  function createKeyString(key, row = false) {
    const canonicalKey = key.slice(0).sort();

    if (!row) {
      return canonicalKey.join(',');
    } else {
      return canonicalKey.map(concept => row[concept]).join(',');
    }
  }

  function loadResource(resource, language) {
    const filePromises = [];

    if (typeof resource.data === 'undefined') {
      resource.data = loadFile(basePath + resource.path);
    }

    filePromises.push(resource.data);

    const languageValid = typeof language !== 'undefined' && getLanguages().includes(language);
    const languageLoaded = typeof resource.translations[language] !== 'undefined';

    if (languageValid) {
      if (!languageLoaded) {
        const translationPath = `${basePath}lang/${language}/${resource.path}`;

        resource.translations[language] = loadFile(translationPath);
      }

      filePromises.push(resource.translations[language]);
    }

    return Promise.all(filePromises).then(fileResponses => {
      const filesData = fileResponses.map(resp => resp.data);
      const primaryKey = resource.schema.primaryKey;
      const data = joinData(primaryKey, 'translation', ...filesData);

      return {data, resource};
    });

  }

  function getLanguages(): string[] {
    if (!datapackage.translations) {
      return [];
    }

    return datapackage.translations.map(lang => lang.id);
  }

  function loadFile(filePath) {
    return new Promise((resolve, reject) => {
      fileReader.readText(filePath, (err, data) => {
        if (err) {
          return reject(new DdfCsvError(FILE_READING_ERROR, err, filePath));
        }

        Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: (headerName) => {
            // can't do dynamic typing without concept types loaded.
            // concept properties are not parsed in first concept query
            // reparsing of concepts resource is done in conceptLookup building
            if (!conceptsLookup) {
              return true;
            }

            // parsing to number/boolean based on concept type
            const concept: any = conceptsLookup.get(headerName) || {};

            return ['boolean', 'measure'].includes(concept.concept_type);
          },
          complete: result => resolve(result),
          error: error => reject(new DdfCsvError(CSV_PARSING_ERROR, error, filePath))
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
        const resources = kvPair.resources.map(
          resourceName => resourcesLookup.get(resourceName)
        );

        if (keyValueLookup.has(key)) {
          keyValueLookup.get(key).set(kvPair.value, resources);
        } else {
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
