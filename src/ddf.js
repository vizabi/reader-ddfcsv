/* eslint-disable max-lines */
/* eslint-disable no-prototype-builtins */
/* eslint-disable max-statements */

import {getTimeRange} from 'ddf-time-utils';
import parallel from 'async-es/parallel';
import uniq from 'lodash/uniq';

const conceptTypeHash = {};
const CACHE = {
  FILE_CACHED: {},
  FILE_REQUESTED: {}
};

let index = null;
let concepts = null;
let entities = null;

export class Ddf {
  constructor(ddfPath, reader) {
    this.ddfPath = ddfPath;
    this.reader = reader;

    if (this.ddfPath[this.ddfPath.length - 1] !== '/') {
      this.ddfPath += '/';
    }
  }

  reset() {
    index = null;
    concepts = null;
    entities = null;
    CACHE.FILE_CACHED = {};
    CACHE.FILE_REQUESTED = {};
  }

  getIndex(cb) {
    const indexFileName = `${this.ddfPath}ddf--index.csv`;

    this.reader.read(indexFileName, (err, data) => {
      if (err) {
        cb(err);
        return;
      }

      index = data;

      cb(null, index);
    });
  }

  getConceptFileNames() {
    const result = [];

    index.forEach(indexRecord => {
      if (indexRecord.key === 'concept') {
        result.push(this.ddfPath + indexRecord.file);
      }
    });

    return uniq(result);
  }

  getSelectParts(query) {
    return query.select.map(selectPart => {
      const pos = selectPart.indexOf('.');

      return pos >= 0 ? selectPart.substr(pos + 1) : selectPart;
    });
  }

  getWhereParts(query) {
    const whereParts = [];

    for (const whereKey in query.where) {
      if (query.where.hasOwnProperty(whereKey)) {
        const pos = whereKey.indexOf('.');

        let value = pos >= 0 ? whereKey.substr(pos + 1) : whereKey;

        value = value.replace(/is--/, '');
        whereParts.push(value);
      }
    }

    return whereParts;
  }


  getEntitySetsByQuery(query) {
    if (!query || !query.select || !query.where) {
      return 'Wrong entities query; it should contain "select" and "where" fields';
    }

    const selectPartsEntitySets = this.getSelectParts(query)
      .filter(part => conceptTypeHash[part] === 'entity_set');
    const wherePartsEntitySets = this.getWhereParts(query)
      .filter(part => conceptTypeHash[part] === 'entity_set');

    return wherePartsEntitySets.length > 0 ? wherePartsEntitySets : selectPartsEntitySets;
  }

  getEntityFileNames(query) {
    const result = [];
    const expectedEntities = this.getEntitySetsByQuery(query);

    if (typeof expectedEntities === 'string') {
      return expectedEntities;
    }

    index.forEach(indexRecord => {
      if (expectedEntities.indexOf(indexRecord.key) >= 0) {
        result.push(this.ddfPath + indexRecord.file);
      }
    });

    return uniq(result);
  }

  // this method detects kind of particular entity file
  getHeaderDescriptor(select, firstRecord) {
    const convert = {};

    let count = 0;

    // following code answers next question:
    // `Is this set of entities contains all of selectable concepts?`
    // or `Is this entities file good for given query?`
    select.forEach(field => {
      // headers should not contain data before `.`
      const pos = field.indexOf('.');
      const fieldF = pos >= 0 ? field.substr(pos + 1) : field;

      if (firstRecord[fieldF]) {
        convert[fieldF] = field;
        count++;
      }
    });

    convert.latitude = 'geo.latitude';
    convert.longitude = 'geo.longitude';

    return {
      // this entity file is expected for future processing
      // if at least one criteria was matched
      needed: count > 0,
      convert
    };
  }

  applyFilter(record, filter) {
    let matches = 0;

    for (const filterKey in filter) {
      if (filter.hasOwnProperty(filterKey)) {
        const pos = filterKey.indexOf('.');
        const normConcept = pos >= 0 ? filterKey.substr(pos + 1) : filterKey;

        if (record[normConcept]) {
          if (record[normConcept].toUpperCase() === filter[filterKey].toString().toUpperCase()) {
            matches++;
          }
        }
      }
    }

    return Object.keys(filter).length === matches;
  }

  // get information for entity correction by filter
  // for example rule `geo.is--country: true` will be generate pair: `geo: "country"`
  // it will be needed when geo column in the entity css is 'country', but Vizabi expects only "geo"
  getFilterConvertPairs(filter) {
    const result = {};

    for (const filterKey in filter) {
      if (filter.hasOwnProperty(filterKey)) {
        const pos = filterKey.indexOf('.');

        if (pos >= 0) {
          result[filterKey.substr(0, pos)] = filterKey.substr(pos).replace(/^.is--/, '');
        }
      }
    }

    return result;
  }

  normalizeAndFilter(headerDescriptor, content, filter) {
    const result = [];
    const convertPairs = this.getFilterConvertPairs(filter);

    content.forEach(record => {
      if (!this.applyFilter(record, filter)) {
        return;
      }

      const recordF = {};

      for (const field in record) {
        if (record.hasOwnProperty(field)) {
          // get filtered data with expected prefix
          // for example, correct:
          // transform (in `geo` file) column `name` to `geo.name` field in `Vizabi's data`
          const fieldF = headerDescriptor.convert[field];

          // add Vizabi oriented data if related concepts are not same in the csv file
          for (const convertPairKey in convertPairs) {
            if (convertPairs.hasOwnProperty(convertPairKey) && record[convertPairs[convertPairKey]]) {
              recordF[convertPairKey] = record[convertPairs[convertPairKey]];
            }
          }

          if (fieldF) {
            recordF[fieldF] = record[field];
          }
        }
      }

      result.push(recordF);
    });

    return result;
  }

  getEntities(query, cb) {
    const entityFileNames = this.getEntityFileNames(query);
    const entityActions =
      entityFileNames
        .map(fileName => onEntryRead => this.reader.read(fileName, err => onEntryRead(err)));

    if (entityActions.length <= 0) {
      cb();
      return;
    }

    parallel(entityActions, err => {
      if (err) {
        cb(err);
        return;
      }

      let entitiesF = [];

      entityFileNames.forEach(fileName => {
        const headerDescriptor = this.getHeaderDescriptor(query.select, this.reader.cache[fileName][0]);

        // apply filter only for entities?
        if (headerDescriptor.needed === true) {
          entitiesF = entitiesF
            .concat(this.normalizeAndFilter(headerDescriptor, this.reader.cache[fileName], query.where));
        }
      });

      if (entitiesF.length > 0) {
        entities = entitiesF;
      }

      cb(null, entities);
    });
  }

  getConcepts(query, cb) {
    const conceptFileNames = this.getConceptFileNames();
    const conceptActions =
      conceptFileNames.map(fileName =>
        onConceptRead => this.reader.read(fileName, err => onConceptRead(err)));

    parallel(conceptActions, err => {
      if (err) {
        cb(err);
        return;
      }

      let conceptsF = [];

      conceptFileNames.forEach(fileName => {
        conceptsF = conceptsF.concat(this.reader.cache[fileName]);
      });

      if (conceptsF.length > 0) {
        concepts = conceptsF;
        concepts.forEach(concept => {
          const splittedConcepts = concept.concept.split(/,/);

          splittedConcepts.forEach(splittedConcept => {
            conceptTypeHash[splittedConcept] = concept.concept_type;
          });
        });
      }

      cb(null, concepts);
    });
  }

  getConceptsAndEntities(query, cb) {
    this.getConcepts(query, (conceptsErr, conceptsPar) => {
      if (conceptsErr) {
        cb(conceptsErr);
        return;
      }

      this.getEntities(query, (entitiesErr, entitiesPar) => {
        cb(entitiesErr, conceptsPar, entitiesPar);
      });
    });
  }

  // extract measures and other concept names from query
  divideByQuery(query) {
    const measures = [];
    const other = [];

    query.select.forEach(partOfSelect => {
      if (conceptTypeHash[partOfSelect] === 'measure') {
        measures.push(partOfSelect);
      }

      if (conceptTypeHash[partOfSelect] !== 'measure') {
        other.push(partOfSelect);
      }
    });

    return {
      measures,
      other
    };
  }

  getDataPointDescriptorsByIndex(query) {
    const descriptors = [];
    const fileNames = [];

    if (index) {
      index.forEach(indexRecord => {
        if (conceptTypeHash[indexRecord.value] === 'measure') {
          const other = indexRecord.key.split(/,/);
          const parts = other.concat(indexRecord.value);

          let founded = 0;

          parts.forEach(part => {
            if (query.select.indexOf(part) >= 0) {
              founded++;
            }
          });

          if (founded === parts.length) {
            fileNames.push(this.ddfPath + indexRecord.file);
            descriptors.push({
              fileName: this.ddfPath + indexRecord.file,
              measures: [indexRecord.value],
              // only one measure should be present in DDF1 data point in case of Vizabi using?
              measure: indexRecord.value,
              other
            });
          }
        }
      });
    }

    return {
      descriptors,
      fileNames
    };
  }

  // data points descriptors will be used for data points content loading
  getDataPointDescriptors(query) {
    this.categorizedQuery = this.divideByQuery(query);

    const descResultByIndex = this.getDataPointDescriptorsByIndex(query);

    return descResultByIndex.descriptors;
  }

  // get data points source
  getDataPointsContent(query, cb) {
    this.dataPointDescriptors = this.getDataPointDescriptors(query);

    const actions = this.dataPointDescriptors
      .map(dataPointDescriptor => onDataPointRead =>
        this.reader.read(dataPointDescriptor.fileName, err => onDataPointRead(err)));

    parallel(actions, err => {
      if (err) {
        cb(err);
        return;
      }

      this.dataPointDescriptors.forEach(dataPointDescriptor => {
        dataPointDescriptor.content = this.reader.cache[dataPointDescriptor.fileName];
      });

      cb();
    });
  }

  getExpectedConcept(type) {
    for (let conceptIndex = 0; conceptIndex < concepts.length; conceptIndex++) {
      if (this.categorizedQuery.other.indexOf(concepts[conceptIndex].concept) >= 0 &&
        concepts[conceptIndex].concept_type === type) {
        return concepts[conceptIndex].concept;
      }
    }

    return null;
  }

  getTimeConcept() {
    return this.getExpectedConcept('time');
  }

  getEntityDomainConcept() {
    return this.getExpectedConcept('entity_domain');
  }

  // get data points data (for reader)
  getDataPoints(query, cb) {
    this.getDataPointsContent(query, err => {
      if (err) {
        cb(err);
        return;
      }

      const entityDomainConcept = this.getEntityDomainConcept();
      const timeConcept = this.getTimeConcept();

      // fill hash (measure by entity_domain and time)
      this.dataPointDescriptors.forEach(pointDescriptor => {
        pointDescriptor.contentHash = {};

        pointDescriptor.content.forEach(record => {
          if (!pointDescriptor.contentHash[record[entityDomainConcept]]) {
            pointDescriptor.contentHash[record[entityDomainConcept]] = {};
          }

          pointDescriptor.contentHash[record[entityDomainConcept]][record[timeConcept]] =
            record[pointDescriptor.measure];
        });
      });

      const result = [];
      // get range for entity_domain
      const entityDomainValues = this.getExpectedEntityDomainValues(this.getEntityDomainConcept());
      // get range for time
      const timeRangeValues = getTimeRange(query.where[this.getTimeConcept()]);

      // fill data points data
      entityDomainValues.forEach(entity => {
        timeRangeValues.forEach(time => {
          const record = {};

          // record (row)
          record[entityDomainConcept] = entity;
          record[timeConcept] = new Date(time);

          // add measures
          let count = 0;

          this.dataPointDescriptors.forEach(pointDescriptor => {
            if (pointDescriptor.contentHash[entity] && pointDescriptor.contentHash[entity][time]) {
              record[pointDescriptor.measure] = Number(pointDescriptor.contentHash[entity][time]);
              count++;
            }
          });

          if (count === this.dataPointDescriptors.length) {
            result.push(record);
          }
        });
      });

      cb(err, result);
    });
  }

  getExpectedEntityDomainValues(entityName) {
    return entities.map(entity => entity[entityName]);
  }
}
