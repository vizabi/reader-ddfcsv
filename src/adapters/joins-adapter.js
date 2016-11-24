import * as Mingo from 'mingo';

import cloneDeep from 'lodash/cloneDeep';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import reduce from 'lodash/reduce';
import replace from 'lodash/replace';
import includes from 'lodash/includes';
import uniq from 'lodash/uniq';
import startsWith from 'lodash/startsWith';
import {getResourcesFilteredBy} from './shared';

const traverse = require('traverse');

/* eslint-disable no-invalid-this */

function getNormalizedBoolean(conditionParam) {
  const condition = cloneDeep(conditionParam);
  const conditionToTraverse = traverse(condition);

  function processConditionBranch() {
    if (startsWith(this.key, 'is--')) {
      conditionToTraverse.set(this.path, this.node === true ? 'TRUE' : 'FALSE');
    }
  }

  conditionToTraverse.forEach(processConditionBranch);

  return condition;
}

function getSynonimicConceptIds(conditionParam) {
  const condition = cloneDeep(conditionParam);
  const conditionToTraverse = traverse(condition);
  const result = [];

  function processConditionBranch() {
    if (startsWith(this.key, 'is--')) {
      result.push(replace(this.key, 'is--', ''));
    }
  }

  conditionToTraverse.forEach(processConditionBranch);

  return uniq(result);
}

/* eslint-enable no-invalid-this */

export class JoinsAdapter {
  constructor(contentManager, reader, ddfPath) {
    this.contentManager = contentManager;
    this.reader = reader;
    this.ddfPath = ddfPath;
  }

  addRequestNormalizer(requestNormalizer) {
    this.requestNormalizer = requestNormalizer;

    return this;
  }

  getDataPackageFilteredBySelect(request, dataPackageContent) {
    return getResourcesFilteredBy(dataPackageContent, (dataPackage, record) =>
      includes(request.key, record.schema.primaryKey));
  }

  getNormalizedRequest(requestParam, onRequestNormalized) {
    const request = cloneDeep(requestParam);
    const allEntitySets = this.contentManager.concepts.filter(concept => concept.concept_type === 'entity_set');
    const synonimicConceptIds = getSynonimicConceptIds(request.where);
    const relatedEntitySetsNames = flatten(
      allEntitySets
        .filter(entitySet => entitySet.domain === requestParam.key)
        .filter(entitySet => includes(synonimicConceptIds, entitySet.concept))
        .map(entitySet => entitySet.concept)
    );

    this.synonimicConceptIds = synonimicConceptIds;

    request.key = [request.key].concat(relatedEntitySetsNames);
    request.where = getNormalizedBoolean(request.where);

    onRequestNormalized(null, request);
  }

  getRecordTransformer() {
    return null;
  }

  getFileActions(expectedFiles) {
    return expectedFiles.map(file => onFileRead => {
      this.reader.readCSV(`${this.ddfPath}${file}`,
        (err, data) => onFileRead(err, data));
    });
  }

  getTimeConcept(concepts) {
    for (const concept of concepts) {
      if (includes(this.contentManager.timeConcepts, concept)) {
        return concept;
      }
    }

    return null;
  }

  getTimeBasedCondition(relatedData, request) {
    const timeConcept = this.getTimeConcept(request.key);

    let result = null;

    if (isEmpty(relatedData) && timeConcept) {
      result = request.where[timeConcept];
    }

    return result;
  }

  getArrayBasedCondition(relatedData, request) {
    let result = null;

    if (!isEmpty(relatedData)) {
      result = {$or: []};

      request.key.forEach(expectedField => {
        result.$or.push({[expectedField]: {$in: relatedData}});
      });
    }

    return result;
  }

  getFinalData(results, request) {
    const data = flatten(results);
    const projection = reduce(
      request.key,
      (currentProjection, field) => {
        currentProjection[field] = 1;

        return currentProjection;
      },
      {});
    const query = new Mingo.Query(request.where, projection);
    const expectedIds = this.synonimicConceptIds.concat(keys(projection));
    const relatedData = query.find(data).all().map(record => {
      let value = null;

      for (const expectedId of expectedIds) {
        if (record[expectedId]) {
          value = record[expectedId];
          break;
        }
      }

      return value;
    });

    return this.getArrayBasedCondition(relatedData, request) ||
      this.getTimeBasedCondition(relatedData, request);
  }
}
