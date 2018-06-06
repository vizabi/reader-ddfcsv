import isEmpty = require('lodash/isEmpty');
import isNil = require('lodash/isNil');
import isObject = require('lodash/isObject');
import isArray = require('lodash/isArray');
import size = require('lodash/size');
import includes = require('lodash/includes');
import filter = require('lodash/filter');
import startsWith = require('lodash/startsWith');
import endsWith = require('lodash/endsWith');
import get = require('lodash/get');
import isString = require('lodash/isString');

const AVAILABLE_QUERY_OPERATORS = new Set(['$eq', '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin', '$or', '$and', '$not', '$nor', '$size', '$all', '$elemMatch']);
const AVAILABLE_FROM_CLAUSE_VALUES = new Set(['concepts', 'entities', 'datapoints', 'schema.concepts', 'schema.entities', 'schema.datapoints']);
const SORT_DIRECTIONS = new Set([ 'asc', 'desc' ]);
const MAX_AMOUNT_OF_MEASURES_IN_SELECT = 5;

export function validateQuery(query, options = {}): void {
  const validationResult = [
    ...validateFrom(query, options),
    ...validateSelect(query, options),
    // ...validateWhere(query, options),
    ...validateLanguage(query, options),
    ...validateJoin(query, options),
    ...validateOrderBy(query, options)
  ];

  const isQueryValid = isEmpty(validationResult);

  if (!isQueryValid) {
    throw new Error(`Too many errors: \n* ${validationResult.join('\n* ')}`);
  }
}

function validateFrom(query: any, options): string[] {
  const errorMessages = [];
  const clause = get(query, 'from', null);

  if (isNil(clause)) {
    errorMessages.push(`'from' clause couldn't be empty`);
  }

  if (!isString(clause)) {
    errorMessages.push(`'from' clause must be string only`);
  }

  if (!AVAILABLE_FROM_CLAUSE_VALUES.has(clause)) {
    const listAvaliableValues = [...AVAILABLE_FROM_CLAUSE_VALUES];
    errorMessages.push(`'from' clause must be one of the list: ${listAvaliableValues.join(', ')}`);
  }

  return errorMessages;
}

function validateSelect(query, options): string[] {
  const errorMessages = [];
  const selectClause = get(query, 'select', null);
  const fromClause = get(query, 'from', null);

  if (isNil(selectClause)) {
    errorMessages.push(`'select' clause couldn't be empty`);
  }

  const key = get(selectClause, 'key');
  const value = get(selectClause, 'value');

  switch (true) {
    case (endsWith(fromClause, '.schema')):
      if (!isArray(key) || size(key) < 2) {
        errorMessages.push(`'select.key' clause for '${fromClause}' queries must have at least 2 items: 'key', 'value'`);
      }
      if (!isArray(value)) {
        errorMessages.push(`'select.value' clause for '${fromClause}' queries should be array of strings or empty`);
      }
      break;
    case (isNil(fromClause)):
      break;
    case (fromClause === 'datapoints'):
      if (!isObject(selectClause) || !isArray(key) || !isArray(value)) {
        errorMessages.push(`'select' clause must have next structure: { key: [...], value: [...] }`);
      }

      if (size(key) < 2) {
        errorMessages.push(`'select.key' clause for '${fromClause}' queries must have at least 2 items`);
      }

      const unavailableKeys = filter(key, (keyItem: string) => {
        const concept = options.conceptsLookup.get(keyItem);
        if (isNil(concept) || !isEntityDomainOrSet(concept.concept_type)) {
          return true;
        }
        return false;
      });
      if (!isEmpty(unavailableKeys)) {
        errorMessages.push(`'select.key' clause for '${fromClause}' queries contains unavailable item(s): ${unavailableKeys.join(', ')} [repo: ${options.basePath}]`);
      }


      if (size(value) < 1) {
        errorMessages.push(`'select.value' clause for '${fromClause}' queries must have at least 1 item`);
      }

      const unavailableValues = filter(value, (valueItem: string) => {
        const concept = options.conceptsLookup.get(valueItem);
        if (isNil(concept) || !isMeasure(concept.concept_type)) {
          return true;
        }
        return false;
      });
      if (!isEmpty(unavailableValues)) {
        errorMessages.push(`'select.value' clause for 'datapoints' queries contains unavailable item(s): ${unavailableValues.join(', ')} [repo: ${options.basePath}]`);
      }
      break;
    default:
      if (!isArray(key) || size(key) !== 1) {
        errorMessages.push(`'select.key' clause for '${fromClause}' queries must have at least 2 items`);
      }
      break;
  }

  // if (!AVAILABLE_FROM_CLAUSE_VALUES.has(clause)) {
  //   const listAvaliableValues = [...AVAILABLE_FROM_CLAUSE_VALUES];
  //   errorMessages.push(`'from' clause must be one of the list: ${listAvaliableValues.join(', ')}`);
  // }

  return errorMessages;
}

function validateWhere(query, options): string[] {
  const errorMessages = [];
  const clausesUnderValidating = [];
  const operatorsUnderValidating = Object.keys(query);

  for (const key of operatorsUnderValidating) {
    if (isInvalidQueryOperator(key.toString())) {
      errorMessages.push('Invalid DDFQL-query. Validation by Operators, not acceptable: ' + key);
    }
  }

  return errorMessages;
}
function validateLanguage(query, options): string[] {
  return [];
}
function validateJoin(query, options): string[] {
  return [];
}
function validateOrderBy(query, options): string[] {
  return [];
}

function isInvalidQueryOperator(operator: string): boolean {
  return startsWith(operator, '$') && !AVAILABLE_QUERY_OPERATORS.has(operator);
}

function isEntityDomainOrSet(conceptType: string): boolean {
  return includes(['entity_domain', 'entity_set', 'time'], conceptType);
}

function isMeasure(conceptType: string): boolean {
  return includes(['measure', 'string'], conceptType);
}