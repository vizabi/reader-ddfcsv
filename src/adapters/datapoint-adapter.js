import {EntityUtils} from '../entity-utils';

import * as Mingo from 'mingo';

import cloneDeep from 'lodash/cloneDeep';
import head from 'lodash/head';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isInteger from 'lodash/isInteger';
import intersection from 'lodash/intersection';
import keys from 'lodash/keys';
import reduce from 'lodash/reduce';
import split from 'lodash/split';
import values from 'lodash/values';

const timeUtils = require('ddf-time-utils');

const timeValuesHash = {};
const timeDescriptorHash = {};

function getTimeDescriptor(time) {
  if (!timeDescriptorHash[time]) {
    timeDescriptorHash[time] = timeUtils.parseTime(time);
  }

  return timeDescriptorHash[time];
}

export class DataPointAdapter {
  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = reader;
    this.ddfPath = ddfPath;
  }

  addRequestNormalizer(requestNormalizer) {
    this.requestNormalizer = requestNormalizer;

    return this;
  }

  getExpectedIndexData(request, indexData) {
    return indexData
      .filter(indexRecord => {
        const indexKeyAsArray = split(indexRecord.key, ',');

        return isEqual(request.select.key, indexKeyAsArray) &&
          includes(request.select.value, indexRecord.value);
      });
  }

  getNormalizedRequest(requestParam, onRequestNormalized) {
    const request = cloneDeep(requestParam);
    const entityUtils =
      new EntityUtils(this.contentManager, this.reader, this.ddfPath, request.where);

    entityUtils.transformConditionByDomain((err, transformedCondition) => {
      request.where = transformedCondition;

      onRequestNormalized(err, request);
    });
  }

  getRecordTransformer(request) {
    const measures =
      this.contentManager.concepts
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

    /* eslint-disable max-statements */

    const transformTimes = record => {
      let isRecordAvailable = true;

      for (const keyToTransform of times) {
        const timeDescriptor = getTimeDescriptor(record[keyToTransform]);

        if (timeDescriptor) {
          if (timeDescriptor.type !== this.requestNormalizer.timeType) {
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

    /* eslint-enable max-statements */

    return record => {
      transformNumbers(record);

      const isRecordAvailable = transformTimes(record);

      return isRecordAvailable ? record : null;
    };
  }

  getEntityFieldByFirstRecord(record) {
    return head(Object.keys(record)
      .filter(recordKey =>
      this.contentManager.conceptTypeHash[recordKey] === 'entity_domain' ||
      this.contentManager.conceptTypeHash[recordKey] === 'entity_set'));
  }

  getTimeFieldByFirstRecord(record) {
    return head(Object.keys(record)
      .filter(recordKey =>
      this.contentManager.conceptTypeHash[recordKey] === 'time'));
  }

  getMeasureFieldByFirstRecord(record) {
    return head(Object.keys(record)
      .filter(recordKey =>
      this.contentManager.conceptTypeHash[recordKey] === 'measure'));
  }

  getFileActions(expectedFiles) {
    return expectedFiles.map(file => onFileRead => {
      this.reader.read(`${this.ddfPath}${file}`, (err, data) => {
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

  /* eslint-disable no-console */

  getFinalData(results, request) {
    const dataHash = [];
    const fields = request.select.key.concat(request.select.value);
    const projection = reduce(
      fields,
      (currentProjection, field) => {
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

      if (this.contentManager.conceptTypeHash[result.entityField] === 'entity_set') {
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
        }

        dataHash[holderKey][measureKey] = record[measureKey];
      });
    });

    const query = new Mingo.Query(request.where, projection);
    const data = values(dataHash);
    const timeKeys = keys(timeValuesHash);
    const filteredData = query
      .find(data)
      .all()
      .map(record => {
        for (const timeKey of timeKeys) {
          if (isInteger(record[timeKey])) {
            record[timeKey] = `${timeValuesHash[timeKey][record[timeKey]]}`;
            break;
          }
        }

        return record;
      });

    return filteredData;
  }
}
