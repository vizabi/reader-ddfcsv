import {EntityUtils} from './entity-utils';

import * as Mingo from 'mingo';

import cloneDeep from 'lodash/cloneDeep';
import concat from 'lodash/concat';
import head from 'lodash/head';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import intersection from 'lodash/intersection';
import reduce from 'lodash/reduce';
import split from 'lodash/split';
import values from 'lodash/values';

export class DataPointAdapter {
  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = reader;
    this.ddfPath = ddfPath;
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
    const shouldBeNumbers = concat(expectedMeasures, times);

    return record => {
      for (const keyToTransform of shouldBeNumbers) {
        if (record[keyToTransform]) {
          record[keyToTransform] = Number(record[keyToTransform]);
        }
      }

      return record;
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

  getCorrectedCondition(condition) {
    const result = cloneDeep(condition);

    if (result.$and && result.$and.length > 1) {
      if (result.$and[1].time && result.$and[1].time.$gte) {
        result.$and[1].time.$gte = Number(result.$and[1].time.$gte);
      }

      if (result.$and[1].time && result.$and[1].time.$lte) {
        result.$and[1].time.$lte = Number(result.$and[1].time.$lte);
      }

      if (result.$and[1].time) {
        result.$and[1].time = Number(result.$and[1].time);
      }
    }

    return result;
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
    const query = new Mingo.Query(this.getCorrectedCondition(request.where), projection);

    results.forEach(result => {
      if (isEmpty(result.data)) {
        return;
      }

      const filteredData = query.find(result.data).all();
      const timeKey = result.timeField;
      const measureKey = result.measureField;

      let entityKey = result.entityField;

      if (this.contentManager.conceptTypeHash[result.entityField] === 'entity_set') {
        entityKey = this.contentManager.domainHash[result.entityField];
      }

      filteredData.forEach(record => {
        const holderKey = `${record[result.entityField]},${record[result.timeField]}`;

        if (!dataHash[holderKey]) {
          dataHash[holderKey] = {
            [entityKey]: record[result.entityField],
            [timeKey]: `${record[result.timeField]}`
          };
          request.select.value.forEach(measure => {
            dataHash[holderKey][measure] = null;
          });
        }

        dataHash[holderKey][measureKey] = record[measureKey];
      });
    });

    return values(dataHash);
  }
}
