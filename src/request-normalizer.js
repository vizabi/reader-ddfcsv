import cloneDeep from 'lodash/cloneDeep';
import includes from 'lodash/includes';
import head from 'lodash/head';
import slice from 'lodash/slice';
import uniq from 'lodash/uniq';

const traverse = require('traverse');
const timeUtils = require('ddf-time-utils');
const COMPARISONS_OPERATORS = ['$gt', '$gte', '$lt', '$lte'];

/* eslint-disable no-invalid-this */

function getCorrectedTime(request, contentManager) {
  const requestToTraverse = traverse(request);
  // const ERROR = 'Time conditions are not correct: time types are not same';

  let timeTypes = [];

  function processConditionBranch() {
    const processTime = timeDescriptor => {
      if (timeDescriptor) {
        requestToTraverse.set(this.path, timeDescriptor.time);
        timeTypes.push(timeDescriptor.type);
      }
    };

    if (includes(contentManager.timeConcepts, this.key) && this.isLeaf) {
      processTime(timeUtils.parseTime(this.node));
    }

    if (includes(COMPARISONS_OPERATORS, this.key)) {
      const parentIndexOffset = 2;
      const parentKey = this.path[this.path.length - parentIndexOffset];

      if (includes(contentManager.timeConcepts, parentKey)) {
        processTime(timeUtils.parseTime(this.node));
      }
    }
  }

  requestToTraverse.forEach(processConditionBranch);

  timeTypes = uniq(timeTypes);

  // provide it later
  // const error = timeTypes.length === 1 ? null : ERROR;
  const error = null;
  const timeType = head(timeTypes);

  return {error, timeType, request: requestToTraverse.value};
}

// ugly hack remove it later

function getCorrectAndClause(request) {
  const requestToTraverse = traverse(request);

  function processConditionBranch() {
    if (this.key === '$and' && this.node.length === 1) {
      requestToTraverse.set(slice(this.path, 0, -1), head(this.node));
    }
  }

  requestToTraverse.forEach(processConditionBranch);

  return requestToTraverse.value;
}

/* eslint-enable no-invalid-this */

export class RequestNormalizer {
  constructor(requestParam, contentManager) {
    this.request = cloneDeep(requestParam);
    this.requestCopy = cloneDeep(requestParam);
    this.contentManager = contentManager;
    this.error = null;
  }

  getNormalized() {
    const correctedTimeDescriptor = getCorrectedTime(this.request, this.contentManager);

    if (correctedTimeDescriptor.error) {
      this.error = correctedTimeDescriptor.error;

      return this.requestCopy;
    }

    this.request = correctedTimeDescriptor.request;
    this.request = getCorrectAndClause(this.request);

    this.timeType = correctedTimeDescriptor.timeType;

    return this.request;
  }
}
