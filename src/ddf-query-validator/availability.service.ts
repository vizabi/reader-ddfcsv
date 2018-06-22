import isEmpty = require('lodash/isEmpty');
import isNil = require('lodash/isNil');
import filter = require('lodash/filter');
import get = require('lodash/get');
import compact = require('lodash/compact');
import {
  isConceptsQuery,
  isDatapointsQuery,
  isEntitiesQuery,
  isEntityDomainOrSet,
  isMeasure,
  isSchemaQuery
} from './helper.service';

export function validateQueryAvailability (queryParam, options = {}): Promise<string | void> {
  const {
    dataset,
    branch,
    commit
  } = queryParam;

  return new Promise((resolve, reject) => {
    return resolve();
  });
}
