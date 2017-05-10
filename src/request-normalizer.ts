import {
  cloneDeep,
  includes,
  head,
  slice,
  uniq
} from 'lodash';
import * as traverse from 'traverse';
import * as timeUtils from 'ddf-time-utils';
import { ContentManager } from './content-manager';

const COMPARISONS_OPERATORS = ['$gt', '$gte', '$lt', '$lte'];

function getCorrectedTime(request, contentManager) {
  const requestToTraverse: any = traverse(request);
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

function getCorrectedBoolean(request, contentManager) {
  const requestToTraverse: any = traverse(request);

  function processConditionBranch() {
    const processBoolean = value => {
      requestToTraverse.set(this.path, value === true ? 'TRUE' : 'FALSE');
    };

    if (includes(contentManager.booleanConcepts, this.key) && this.isLeaf) {
      processBoolean(this.node);
    }

    if (includes(COMPARISONS_OPERATORS, this.key)) {
      const parentIndexOffset = 2;
      const parentKey = this.path[this.path.length - parentIndexOffset];

      if (includes(contentManager.booleanConcepts, parentKey)) {
        processBoolean(this.node);
      }
    }
  }

  requestToTraverse.forEach(processConditionBranch);

  return requestToTraverse.value;
}

// ugly hack remove it later

function getCorrectAndClause(request) {
  const requestToTraverse: any = traverse(request);

  function processConditionBranch() {
    if (this.key === '$and' && this.node.length === 1) {
      requestToTraverse.set(slice(this.path, 0, -1), head(this.node));
    }
  }

  requestToTraverse.forEach(processConditionBranch);

  return requestToTraverse.value;
}

export class RequestNormalizer {
  public request: any;
  public requestCopy: any;
  public contentManager: ContentManager;
  public error: any;
  public timeType: any;

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
    this.request = getCorrectedBoolean(this.request, this.contentManager);

    this.timeType = correctedTimeDescriptor.timeType;

    return this.request;
  }
}
