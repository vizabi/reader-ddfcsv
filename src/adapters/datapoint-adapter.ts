import {EntityUtils} from '../entity-utils';
import {
  cloneDeep,
  head,
  isEmpty,
  isEqual,
  isInteger,
  intersection,
  keys,
  map,
  reduce,
  values
} from 'lodash';
import {getResourcesFilteredBy} from './shared';
import * as timeUtils from 'ddf-time-utils';
import {ContentManager} from '../content-manager';
import {IReader} from '../file-readers/reader';
import {RequestNormalizer} from '../request-normalizer';
import {IDdfAdapter} from './adapter';

const Mingo = require('mingo');

const timeValuesHash = {};
const timeDescriptorHash = {};

function getTimeDescriptor(time) {
  if (!timeDescriptorHash[time]) {
    timeDescriptorHash[time] = timeUtils.parseTime(time);
  }

  return timeDescriptorHash[time];
}

export class DataPointAdapter implements IDdfAdapter {
  public contentManager: ContentManager;
  public reader: IReader;
  public ddfPath: string;
  public requestNormalizer: RequestNormalizer;
  public entitySetsHash: any;

  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = cloneDeep(reader);
    this.ddfPath = ddfPath;
    this.entitySetsHash = {};

    keys(this.contentManager.domainHash).forEach(entitySet => {
      const entityDomain = this.contentManager.domainHash[entitySet];

      if (!this.entitySetsHash[entityDomain]) {
        this.entitySetsHash[entityDomain] = [];
      }

      this.entitySetsHash[entityDomain].push(entitySet);
    });
  }

  addRequestNormalizer(requestNormalizer) {
    this.requestNormalizer = requestNormalizer;

    return this;
  }

  getDataPackageFilteredBySelect(request, dataPackageContent) {
    const matchByValue = (dataPackage, record) => {
      const fields = map(record.schema.fields, 'name');

      return !isEmpty(intersection(fields, request.select.value));
    };
    const matchByEntityAndValue = (dataPackage, record) => {
      const isMatchedByKey = isEqual(request.select.key, record.schema.primaryKey);

      return isMatchedByKey && matchByValue(dataPackage, record);
    };
    const matchByEntityDomainAndValue = (dataPackage, record) => {
      const isMatchedByDomain = !isEmpty(intersection(keys(this.entitySetsHash), request.select.key));

      return isMatchedByDomain && matchByValue(dataPackage, record);
    };

    let result = getResourcesFilteredBy(dataPackageContent, matchByEntityAndValue);

    if (isEmpty(result)) {
      result = getResourcesFilteredBy(dataPackageContent, matchByEntityDomainAndValue);
    }
    return result;
  }

  getNormalizedRequest(requestParam, onRequestNormalized) {
    const request = cloneDeep(requestParam);
    const entityUtils = new EntityUtils(this.contentManager, this.reader, this.ddfPath, request.where);

    entityUtils.transformConditionByDomain((err, transformedCondition) => {
      request.where = transformedCondition;

      onRequestNormalized(err, request);
    });
  }

  getRecordTransformer(request) {
    const measures = this.contentManager.concepts
      .filter(conceptRecord => conceptRecord.concept_type === 'measure')
      .map(conceptRecord => conceptRecord.concept);
    const expectedMeasures = intersection(measures, request.select.value);
    const times = this.contentManager.concepts
      .filter(conceptRecord => conceptRecord.concept_type === 'time')
      .map(conceptRecord => conceptRecord.concept);
    const transformNumbers = record => {
      for (const keyToTransform of expectedMeasures) {
        if (record[keyToTransform] && record[keyToTransform]) {
          record[keyToTransform] = Number(record[keyToTransform]);
        }
      }
    };

    const transformTimes = record => {
      let isRecordAvailable = true;

      for (const keyToTransform of times) {
        const timeDescriptor = getTimeDescriptor(record[keyToTransform]);

        if (timeDescriptor) {
          if (this.requestNormalizer.timeType && timeDescriptor.type !== this.requestNormalizer.timeType) {
            isRecordAvailable = false;
            break;
          }

          if (!timeValuesHash[keyToTransform]) {
            timeValuesHash[keyToTransform] = {};
          }

          timeValuesHash[keyToTransform][timeDescriptor.time] = record[keyToTransform];
          record[keyToTransform] = timeDescriptor.time;
        }
      }

      return isRecordAvailable;
    };

    return record => {
      transformNumbers(record);

      const isRecordAvailable = transformTimes(record);

      return isRecordAvailable ? record : null;
    };
  }

  isTimeConcept(conceptName) {
    return this.contentManager.conceptTypeHash[conceptName] === 'time';
  }

  isMeasureConcept(conceptName) {
    return this.contentManager.conceptTypeHash[conceptName] === 'measure';
  }

  isEntitySetConcept(conceptName) {
    return this.contentManager.conceptTypeHash[conceptName] === 'entity_set';
  }

  isDomainRelatedConcept(conceptName) {
    const container = this.contentManager.conceptTypeHash;

    return container[conceptName] === 'entity_domain' || this.isEntitySetConcept(conceptName);
  }

  getEntityFieldByFirstRecord(record) {
    return Object.keys(record).find(conceptName => this.isDomainRelatedConcept(conceptName));
  }

  getTimeFieldByFirstRecord(record) {
    return Object.keys(record).find(conceptName => this.isTimeConcept(conceptName));
  }

  getMeasureFieldByFirstRecord(record) {
    return Object.keys(record).find(conceptName => this.isMeasureConcept(conceptName));
  }

  getFileActions(expectedFiles) {
    return expectedFiles.map(file => onFileRead => {
      this.reader.readCSV(`${this.ddfPath}${file}`, (err, data) => {
        if (err || isEmpty(data)) {
          onFileRead(err, [], {});
          return;
        }

        const firstRecord = head(data);
        const entityField = this.getEntityFieldByFirstRecord(firstRecord);
        const timeField = this.getTimeFieldByFirstRecord(firstRecord);
        const measureField = this.getMeasureFieldByFirstRecord(firstRecord);

        onFileRead(null, {data, entityField, timeField, measureField});
      });
    });
  }

  getFinalData(results, request) {
    const dataHash = [];
    const fields = request.select.key.concat(request.select.value);
    const projection = reduce(
      fields,
      (currentProjection, field: string) => {
        currentProjection[field] = 1;

        return currentProjection;
      },
      {});

    results.forEach(result => {
      if (isEmpty(result.data)) {
        return;
      }

      const timeKey = result.timeField;
      const measureKey = result.measureField;

      let entityKey = result.entityField;
      let entitySetKey = null;

      if (this.isEntitySetConcept(result.entityField)) {
        entitySetKey = entityKey;
        entityKey = this.contentManager.domainHash[result.entityField];
      }

      result.data.forEach(record => {
        const holderKey = `${record[result.entityField]},${record[result.timeField]}`;

        if (!dataHash[holderKey]) {
          dataHash[holderKey] = {
            [entityKey]: record[result.entityField],
            [timeKey]: record[result.timeField]
          };
          request.select.value.forEach(measure => {
            dataHash[holderKey][measure] = null;
          });

          if (entitySetKey) {
            dataHash[holderKey][entitySetKey] = record[result.entityField];
          }
        }

        dataHash[holderKey][measureKey] = record[measureKey];
      });
    });

    const query = new Mingo.Query(request.where);
    const data = values(dataHash);
    const timeKeys = keys(timeValuesHash);
    const filteredData = query.find(data).all().map(record => {
      const resultRecord = {};
      const projectionKeys = keys(projection);

      for (const projectionKey of projectionKeys) {
        resultRecord[projectionKey] = record[projectionKey];
      }

      for (const timeKey of timeKeys) {
        if (isInteger(record[timeKey])) {
          resultRecord[timeKey] = `${timeValuesHash[timeKey][record[timeKey]]}`;
          break;
        }
      }

      return resultRecord;
    });

    return filteredData;
  }
}
