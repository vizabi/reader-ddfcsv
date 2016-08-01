import uniq from 'lodash/uniq';

function applyFilter(record, filter) {
  const filterKeys = Object.keys(filter);

  let matches = 0;

  filterKeys.forEach(filterKey => {
    const pos = filterKey.indexOf('.');
    const normConcept = pos >= 0 ? filterKey.substr(pos + 1) : filterKey;

    if (record[normConcept]) {
      if (record[normConcept].toUpperCase() === filter[filterKey].toString().toUpperCase()) {
        matches++;
      }
    }
  });

  return filterKeys.length === matches;
}

// get information for entity correction by filter
// for example rule `geo.is--country: true` will be generate pair: `geo: "country"`
// it will be needed when geo column in the entity css is 'country', but Vizabi expects only "geo"
function getFilterConvertPairs(filter) {
  const result = {};

  Object.keys(filter).forEach(filterKey => {
    const pos = filterKey.indexOf('.');

    if (pos >= 0) {
      result[filterKey.substr(0, pos)] = filterKey.substr(pos).replace(/^.is--/, '');
    }
  });

  return result;
}

function getSelectParts(query) {
  return query.select.map(selectPart => {
    const pos = selectPart.indexOf('.');

    return pos >= 0 ? selectPart.substr(pos + 1) : selectPart;
  });
}

function getWhereParts(query) {
  const whereParts = [];
  const IS_PREFIX_REGEX = /is--/;

  Object.keys(query.where).forEach(whereKey => {
    const pos = whereKey.indexOf('.');

    let value = pos >= 0 ? whereKey.substr(pos + 1) : whereKey;

    value = value.replace(IS_PREFIX_REGEX, '');
    whereParts.push(value);
  });

  return whereParts;
}

export class QueryManager {
  constructor(ddfPath, contentManager) {
    this.ddfPath = ddfPath;
    this.contentManager = contentManager;
  }

  setIndex(indexData) {
    this.indexData = indexData;
  }

  getConceptFileNames() {
    return uniq(this.indexData
      .filter(indexRecord => indexRecord.key === 'concept')
      .map(indexRecord => `${this.ddfPath}/${indexRecord.file}`));
  }

  getEntitySetsByQuery(query) {
    if (!query) {
      return Object.keys(this.contentManager.conceptTypeHash)
        .filter(conceptKey => this.contentManager.conceptTypeHash[conceptKey] === 'entity_set');
    }

    const selectPartsEntitySets = getSelectParts(query)
      .filter(part => this.contentManager.conceptTypeHash[part] === 'entity_set');
    const wherePartsEntitySets = getWhereParts(query)
      .filter(part => this.contentManager.conceptTypeHash[part] === 'entity_set');

    return wherePartsEntitySets.length > 0 ? wherePartsEntitySets : selectPartsEntitySets;
  }

  normalizeAndFilter(headerDescriptor, content, filter) {
    const convertPairs = getFilterConvertPairs(filter);

    return content
      .filter(record => applyFilter(record, filter))
      .map(record => {
        const filteredRecord = {};

        Object.keys(record).forEach(field => {
          // get filtered data with expected prefix
          // for example, correct:
          // transform (in `geo` file) column `name` to `geo.name` field in `Vizabi's data`
          const convertedField = headerDescriptor.convert[field];

          // add Vizabi oriented data if related concepts are not same in the csv file
          Object.keys(convertPairs).forEach(convertPairKey => {
            filteredRecord[convertPairKey] = record[convertPairs[convertPairKey]];
          });

          if (convertedField) {
            filteredRecord[convertedField] = record[field];
          }
        });

        return filteredRecord;
      });
  }

  // extract measures and other concept names from query
  divideConceptsFromQueryByType(query) {
    const measures = query.select
      .filter(partOfSelect => this.contentManager.conceptTypeHash[partOfSelect] === 'measure');
    const other = query.select
      .filter(partOfSelect => this.contentManager.conceptTypeHash[partOfSelect] !== 'measure');

    return {measures, other};
  }
}
