import {ContentManager} from './content-manager';
import {QueryManager} from './query-manager';
import {getTimeRange} from 'ddf-time-utils';

import parallel from 'async-es/parallel';

import compact from 'lodash/compact';
import flatten from 'lodash/flatten';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

const contentManager = new ContentManager();

export class Ddf {
  constructor(ddfPath, reader) {
    this.ddfPath = ddfPath;
    this.reader = reader;
    this.queryManager = new QueryManager(this.ddfPath, contentManager);

    if (this.ddfPath[this.ddfPath.length - 1] !== '/') {
      this.ddfPath += '/';
    }
  }

  getIndex(onIndexLoaded) {
    const indexFileName = `${this.ddfPath}ddf--index.csv`;

    this.reader.read(indexFileName, (err, data) => {
      if (err) {
        onIndexLoaded(err);
        return;
      }

      contentManager.index = data;
      this.queryManager.setIndex(contentManager.index);

      onIndexLoaded(null, contentManager.index);
    });
  }

  getEntityFileNames(query) {
    const expectedEntities = this.queryManager.getEntitySetsByQuery(query);

    return uniq(contentManager.index
      .filter(indexRecord => includes(expectedEntities, indexRecord.key))
      .map(indexRecord => this.ddfPath + indexRecord.file));
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
      const correctedField = pos >= 0 ? field.substr(pos + 1) : field;

      if (firstRecord[correctedField]) {
        convert[correctedField] = field;
        count++;
      }
    });

    convert.latitude = 'geo.latitude';
    convert.longitude = 'geo.longitude';

    return {
      // this entity file is expected for future processing
      // if at least one criteria was matched
      shouldBeProcessed: count > 0,
      convert
    };
  }

  getEntities(query, onEntitiesLoaded) {
    const entityFileNames = this.getEntityFileNames(query);
    const entityActions =
      entityFileNames
        .map(fileName => onEntryRead => this.reader.read(fileName, err => onEntryRead(err)));

    if (isEmpty(entityActions)) {
      onEntitiesLoaded();
      return;
    }

    parallel(entityActions, err => {
      if (err) {
        onEntitiesLoaded(err);
        return;
      }

      const entities = compact(
        flatten(
          entityFileNames.map(fileName => {
            const headerDescriptor = this.getHeaderDescriptor(query.select, this.reader.cache[fileName][0]);

            // apply filter only for entities?
            if (headerDescriptor.shouldBeProcessed === true) {
              return this.queryManager.normalizeAndFilter(headerDescriptor, this.reader.cache[fileName], query.where);
            }

            return null;
          })
        )
      );

      if (!isEmpty(entities)) {
        contentManager.entities = entities;
      }

      onEntitiesLoaded(null, contentManager.entities);
    });
  }

  getConcepts(onConceptsLoaded) {
    const conceptFileNames = this.queryManager.getConceptFileNames();
    const conceptActions =
      conceptFileNames.map(fileName =>
        onConceptRead => this.reader.read(fileName, err => onConceptRead(err)));

    parallel(conceptActions, err => {
      if (err) {
        onConceptsLoaded(err);
        return;
      }

      const concepts = flatten(compact(conceptFileNames.map(fileName => this.reader.cache[fileName])));

      if (!isEmpty(concepts)) {
        contentManager.concepts = concepts;
        contentManager.concepts.forEach(concept => {
          const splittedConcepts = concept.concept.split(/,/);

          splittedConcepts.forEach(splittedConcept => {
            contentManager.conceptTypeHash[splittedConcept] = concept.concept_type;
          });
        });
      }

      onConceptsLoaded(null, contentManager.concepts);
    });
  }

  getConceptsAndEntities(query, onDataLoaded) {
    this.getConcepts((conceptsErr, conceptsPar) => {
      if (conceptsErr) {
        onDataLoaded(conceptsErr);
        return;
      }

      this.getEntities(query, (entitiesErr, entitiesPar) => {
        onDataLoaded(entitiesErr, conceptsPar, entitiesPar);
      });
    });
  }

  getDataPointDescriptorsByIndex(query) {
    const descriptors = [];
    const fileNames = [];

    if (!contentManager.index) {
      throw Error('index is not found');
    }

    contentManager.index.forEach(indexRecord => {
      if (contentManager.conceptTypeHash[indexRecord.value] === 'measure') {
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

    return {descriptors, fileNames};
  }

  // data points descriptors will be used for data points content loading
  getDataPointDescriptors(query) {
    this.categorizedQuery = this.queryManager.divideConceptsFromQueryByType(query);

    const descResultByIndex = this.getDataPointDescriptorsByIndex(query);

    return descResultByIndex.descriptors;
  }

  getDataPointsContentByQuery(query, onDataPointsLoaded) {
    this.dataPointDescriptors = this.getDataPointDescriptors(query);

    const actions = this.dataPointDescriptors
      .map(dataPointDescriptor => onDataPointRead =>
        this.reader.read(dataPointDescriptor.fileName, err => onDataPointRead(err)));

    parallel(actions, err => {
      if (err) {
        onDataPointsLoaded(err);
        return;
      }

      this.dataPointDescriptors.forEach(dataPointDescriptor => {
        dataPointDescriptor.content = this.reader.cache[dataPointDescriptor.fileName];
      });

      onDataPointsLoaded();
    });
  }

  getAllDataPointsContent(onDataPointsFileLoaded, onDataAllPointsLoaded) {
    const measureRecords = contentManager.index
      .filter(indexRecord => contentManager.conceptTypeHash[indexRecord.value] === 'measure')
      .filter(indexRecord => indexRecord.value !== 'latitude' && indexRecord.value !== 'longitude');
    const actions = measureRecords
      .map(measureFileRecord => onDataPointFileRead =>
        this.reader.read(this.ddfPath + measureFileRecord.file, (err, content) => {
          onDataPointsFileLoaded(err, {measure: measureFileRecord.value, content});
          onDataPointFileRead(err);
        }));

    parallel(actions, err => onDataAllPointsLoaded(err));
  }

  getExpectedNonMeasureConcept(type) {
    for (let conceptIndex = 0; conceptIndex < contentManager.concepts.length; conceptIndex++) {
      if (includes(this.categorizedQuery.other, contentManager.concepts[conceptIndex].concept) &&
        contentManager.concepts[conceptIndex].concept_type === type) {
        return contentManager.concepts[conceptIndex].concept;
      }
    }

    return null;
  }

  getTimeConcept() {
    return this.getExpectedNonMeasureConcept('time');
  }

  getEntityDomainConcept() {
    return this.getExpectedNonMeasureConcept('entity_domain');
  }

  // get data points data (for reader)
  getDataPoints(query, onDataPointsLoaded) {
    const result = [];
    const prepareMeasureTimeEntityHash = (entityDomainConcept, timeConcept) => {
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
    };
    const prepareNonMeasureValues = () => {
      // get range for entity_domain
      const entityDomainValues = this.getExpectedEntityDomainValues(this.getEntityDomainConcept());
      // get range for time
      const timeRangeValues = getTimeRange(query.where[this.getTimeConcept()]);

      return {entityDomainValues, timeRangeValues};
    };

    this.getDataPointsContentByQuery(query, err => {
      if (err) {
        onDataPointsLoaded(err);
        return;
      }

      const entityDomainConcept = this.getEntityDomainConcept();
      const timeConcept = this.getTimeConcept();

      prepareMeasureTimeEntityHash(entityDomainConcept, timeConcept);
      const {entityDomainValues, timeRangeValues} = prepareNonMeasureValues();

      // fill data points data
      entityDomainValues.forEach(entity => {
        timeRangeValues.forEach(time => {
          const record = {[entityDomainConcept]: entity, [timeConcept]: new Date(time)};
          const addMeasures = () => {
            let count = 0;

            this.dataPointDescriptors.forEach(pointDescriptor => {
              if (pointDescriptor.contentHash[entity] && pointDescriptor.contentHash[entity][time]) {
                record[pointDescriptor.measure] = Number(pointDescriptor.contentHash[entity][time]);
                count++;
              }
            });

            return count;
          };

          if (addMeasures() === this.dataPointDescriptors.length) {
            result.push(record);
          }
        });
      });

      onDataPointsLoaded(err, result);
    });
  }

  getExpectedEntityDomainValues(entityName) {
    return contentManager.entities.map(entity => entity[entityName]);
  }
}
