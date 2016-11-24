/* eslint-disable */

import * as Mingo from 'mingo';

import compact from 'lodash/compact';
import cloneDeep from 'lodash/cloneDeep';
import flatten from 'lodash/flatten';
import reduce from 'lodash/reduce';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import startsWith from 'lodash/startsWith';
import uniq from 'lodash/uniq';
import {getResourcesFilteredBy} from './shared';

const traverse = require('traverse');

const VALUE_WITH_PREFIX_REGEX = /^.*\./;

/* eslint-disable no-invalid-this */

function getCroppedKeys(conditionParam) {
  const condition = cloneDeep(conditionParam);
  const conditionToTraverse = traverse(condition);

  function processConditionBranch() {
    if (includes(this.key, '.') && this.isLeaf) {
      this.path[this.path.length - 1] = this.key.replace(VALUE_WITH_PREFIX_REGEX, '');
      conditionToTraverse.set(this.path, this.node);
      this.remove();
    }
  }

  conditionToTraverse.forEach(processConditionBranch);

  return condition;
}

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

/* eslint-enable no-invalid-this */

export class EntityAdapter {
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
      includes(request.select.key, record.schema.primaryKey));
  }

  getDomainDescriptorsByRequestKeys(requestKey) {
    return compact(uniq(
      requestKey
        .map(key => ({key, domain: this.contentManager.domainHash[key]}))
        .filter(descriptor => !!descriptor.domain)
    ));
  }

  getNormalizedRequest(requestParam, onRequestNormalized) {
    const request = cloneDeep(requestParam);
    const allEntitySets = this.contentManager.concepts.filter(concept => concept.concept_type === 'entity_set');
    const relatedEntitySetsNames = flatten(
      requestParam.select.key
        .map(key => allEntitySets
          .filter(entitySet => entitySet.domain === key)
          .map(entitySet => entitySet.concept))
    );

    request.select.key = request.select.key.concat(relatedEntitySetsNames);
    request.select.value = request.select.value
      .map(value => value.replace(VALUE_WITH_PREFIX_REGEX, ''))
      .filter(value => value !== '_default');
    request.where = getNormalizedBoolean(getCroppedKeys(request.where));

    this.domainDescriptors = this.getDomainDescriptorsByRequestKeys(request.select.key);
    this.request = request;

    onRequestNormalized(null, request);
  }

  getRecordTransformer() {
    const isTruth = value => value === 'true' || value === 'TRUE';

    return record => {
      // entity set to domain
      if (!isEmpty(this.domainDescriptors)) {
        for (const domainDescriptor of this.domainDescriptors) {
          if (isTruth(record[`is--${domainDescriptor.key}`]) && isEmpty(record[domainDescriptor.domain])) {
            record[domainDescriptor.domain] = record[domainDescriptor.key];
            break;
          }
        }
      }

      // domain to entity set
      for (const requestValue of this.request.select.value) {
        const domain = this.contentManager.domainHash[requestValue];

        if (isEmpty(record[requestValue]) && !isEmpty(record[domain])) {
          record[requestValue] = record[domain];
        }
      }

      return record;
    };
  }

  getFileActions(expectedFiles) {
    return expectedFiles.map(file => onFileRead => {
      this.reader.readCSV(`${this.ddfPath}${file}`,
        (err, data) => onFileRead(err, data));
    });
  }

  getFinalData(results, request) {
    const data = flatten(results);
    const fields = request.select.key.concat(request.select.value);
    const projection = reduce(
      fields,
      (currentProjection, field) => {
        currentProjection[field] = 1;
        return currentProjection;
      },
      {});
    const query = new Mingo.Query(request.where, projection);

    return query.find(data).all();
  }
}
