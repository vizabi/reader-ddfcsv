import isEmpty = require('lodash/isEmpty');
import isNil = require('lodash/isNil');
import isObject = require('lodash/isObject');
import isArray = require('lodash/isArray');
import size = require('lodash/size');
import get = require('lodash/get');
import compact = require('lodash/compact');
import isString = require('lodash/isString');

import {
  AVAILABLE_FROM_CLAUSE_VALUES,
  isConceptsQuery,
  isDatapointsQuery,
  isEntitiesQuery,
  isInvalidQueryOperator,
  isSchemaQuery
} from './helper.service';

export function validateQueryStructure (query, options = {}): Promise<string | void> {
  return new Promise((resolve, reject) => {
    const validationResult = [
      ...validateFromStructure(query, options),
      ...validateSelectStructure(query, options),
      // ...validateWhereStructure(query, options),
      ...validateLanguageStructure(query, options),
      ...validateJoinStructure(query, options),
      ...validateOrderByStructure(query, options)
    ];

    const isQueryValid = isEmpty(validationResult);

    if (!isQueryValid) {
      return reject(`Too many query structure errors: \n* ${validationResult.join('\n* ')}`);
    }

    return resolve();
  });
}

function validateFromStructure (query: any, options): string[] {
  const errorMessages = [];
  const clause = get(query, 'from', null);

  if (isNil(clause)) {
    errorMessages.push(`'from' clause couldn't be empty`);
  }

  if (!isString(clause)) {
    errorMessages.push(`'from' clause must be string only`);
  }

  if (!AVAILABLE_FROM_CLAUSE_VALUES.has(clause)) {
    const listAvaliableValues = [ ...AVAILABLE_FROM_CLAUSE_VALUES ];
    errorMessages.push(`'from' clause must be one of the list: ${listAvaliableValues.join(', ')}`);
  }

  return errorMessages;
}

function validateSelectStructure (query, options): string[] {
  const errorMessages = [];
  const selectClause = get(query, 'select', null);
  const fromClause = get(query, 'from', null);
  const key = get(selectClause, 'key');
  const value = get(selectClause, 'value');

  switch (true) {
    case (isSchemaQuery(query)):
      errorMessages.push(
        checkIfSelectIsEmpty(selectClause),
        // checkIfSelectHasInvalidStructure(selectClause, key, value),
        checkIfSchemasSelectKeyHasInvalidStructure(fromClause, key),
        checkIfSchemasSelectValueHasInvalidStructure(fromClause, value)
      );
      break;
    case (isEntitiesQuery(query)):
      errorMessages.push(
        checkIfSelectIsEmpty(selectClause),
        checkIfSelectKeyHasInvalidStructure(fromClause, key)
      );
      break;
    case (isConceptsQuery(query)):
      errorMessages.push(
        checkIfSelectIsEmpty(selectClause),
        checkIfSelectKeyHasInvalidStructure(fromClause, key)
      );
      break;
    case (isDatapointsQuery(query)):
      errorMessages.push(
        checkIfSelectIsEmpty(selectClause),
        checkIfSelectHasInvalidStructure(selectClause, key, value),
        checkIfDatapointsSelectKeyHasInvalidStructure(fromClause, key),
        checkIfDatapointsSelectValueHasInvalidStructure(fromClause, value)
      );
      break;
    default:
      errorMessages.push(
        checkIfSelectIsEmpty(selectClause),
      );
      break;
  }

  // if (!AVAILABLE_FROM_CLAUSE_VALUES.has(clause)) {
  //   const listAvaliableValues = [...AVAILABLE_FROM_CLAUSE_VALUES];
  //   errorMessages.push(`'from' clause must be one of the list: ${listAvaliableValues.join(', ')}`);
  // }

  return compact(errorMessages);
}

function validateWhereStructure (query, options): string[] {
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

function validateLanguageStructure (query, options): string[] {
  return [];
}

function validateJoinStructure (query, options): string[] {
  return [];
}

function validateOrderByStructure (query, options): string[] {
  return [];
}

// Common select structure errors
function checkIfSelectIsEmpty(selectClause) {
  if (isNil(selectClause)) {
    return `'select' clause couldn't be empty`;
  }
}

function checkIfSelectHasInvalidStructure(selectClause, key, value) {
  if (!isObject(selectClause) || !isArray(key) || !isArray(value)) {
    return `'select' clause must have next structure: { key: [...], value: [...] }`;
  }
}

// * specific datapoints select errors
function checkIfDatapointsSelectKeyHasInvalidStructure(fromClause, key) {
  if (size(key) < 2) {
    return `'select.key' clause for '${fromClause}' queries must have at least 2 items`;
  }
}

function checkIfDatapointsSelectValueHasInvalidStructure(fromClause, value) {
  if (size(value) < 1) {
    return `'select.value' clause for '${fromClause}' queries must have at least 1 item`;
  }
}

// * specific schemas select errors
function checkIfSchemasSelectKeyHasInvalidStructure(fromClause, key) {
  if (size(key) < 2) {
    return `'select.key' clause for '${fromClause}' queries must have at least 2 items: 'key', 'value'`;
  }
}

function checkIfSchemasSelectValueHasInvalidStructure(fromClause, value) {
  if (!isArray(value) && !isNil(value)) {
    return `'select.value' clause for '${fromClause}' queries should be array of strings or empty`;
  }
}

// * specific concepts/entities select errors
function checkIfSelectKeyHasInvalidStructure(fromClause, key) {
  if (!isArray(key) || size(key) !== 1) {
    return `'select.key' clause for '${fromClause}' queries must have only 1 item`;
  }
}
