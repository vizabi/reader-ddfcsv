import isEmpty = require('lodash/isEmpty');
import isNil = require('lodash/isNil');
import isObject = require('lodash/isObject');
import isArray = require('lodash/isArray');
import size = require('lodash/size');
import includes = require('lodash/includes');
import filter = require('lodash/filter');
import startsWith = require('lodash/startsWith');
import get = require('lodash/get');
import compact = require('lodash/compact');
import isString = require('lodash/isString');

export const AVAILABLE_QUERY_OPERATORS = new Set([
  '$eq', '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin',
  '$or', '$and', '$not', '$nor', '$size', '$all', '$elemMatch'
]);

export const SCHEMAS = new Set([ 'concepts.schema', 'entities.schema', 'datapoints.schema' ]);
export const DATAPOINTS = 'datapoints';
export const ENTITIES = 'entities';
export const CONCEPTS = 'concepts';

export const AVAILABLE_FROM_CLAUSE_VALUES = new Set([
  CONCEPTS, ENTITIES, DATAPOINTS, ...SCHEMAS
]);

const SORT_DIRECTIONS = new Set([ 'asc', 'desc' ]);
const MAX_AMOUNT_OF_MEASURES_IN_SELECT = 5;

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
      return reject(`Too many errors: \n* ${validationResult.join('\n* ')}`);
    }
    return resolve();
  });
}

export function validateQueryDefinitions (query, options = {}): void {
  const validationResult = [
    ...validateSelectDefinitions(query, options),
    // ...validateWhereDefinitions(query, options),
    // ...validateLanguageDefinitions(query, options),
    // ...validateJoinDefinitions(query, options),
    // ...validateOrderByDefinitions(query, options)
  ];

  const isQueryValid = isEmpty(validationResult);

  if (!isQueryValid) {
    throw new Error(`Too many errors: \n* ${validationResult.join('\n* ')}`);
  }
}

export function isSchemaQuery (query) {
  const fromClause = get(query, 'from');
  return SCHEMAS.has(fromClause);
}

export function isDatapointsQuery (query) {
  const fromClause = get(query, 'from');
  return fromClause === DATAPOINTS;
}

export function isEntitiesQuery (query) {
  const fromClause = get(query, 'from');
  return fromClause === ENTITIES;
}

export function isConceptsQuery (query) {
  const fromClause = get(query, 'from');
  return fromClause === CONCEPTS;
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
        checkIfSelectHasInvalidStructure(selectClause, key, value),
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

function validateSelectDefinitions (query, options): string[] {
  const errorMessages = [];
  const selectClause = get(query, 'select', null);
  const fromClause = get(query, 'from', null);
  const key = get(selectClause, 'key');
  const value = get(selectClause, 'value');

  switch (true) {
    case (isSchemaQuery(query)):
      errorMessages.push(...[]);
      break;
    case (isEntitiesQuery(query)):
      errorMessages.push(...[]);
      break;
    case (isConceptsQuery(query)):
      errorMessages.push(...[]);
      break;
    case (isDatapointsQuery(query)):
      errorMessages.push(
        checkIfSelectKeyHasInvalidDefinitions(fromClause, key, options),
        checkIfSelectValueHasInvalidDefinitions(fromClause, value, options)
      );
      break;
    default:
      break;
  }

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

function isInvalidQueryOperator (operator: string): boolean {
  return startsWith(operator, '$') && !AVAILABLE_QUERY_OPERATORS.has(operator);
}

function isEntityDomainOrSet (conceptType: string): boolean {
  return includes([ 'entity_domain', 'entity_set', 'time' ], conceptType);
}

function isMeasure (conceptType: string): boolean {
  return includes([ 'measure', 'string' ], conceptType);
}

// Common select definitions error
function checkIfSelectKeyHasInvalidDefinitions(fromClause, key, options): string | void {
  const unavailableKeys: string[] = getUnavailableSelectKeys(key, options);
  if (!isEmpty(unavailableKeys)) {
    return `'select.key' clause for '${fromClause}' queries contains unavailable item(s): ${unavailableKeys.join(', ')} [repo: ${options.basePath}]`;
  }
}

function checkIfSelectValueHasInvalidDefinitions(fromClause, value, options): string | void {
  const unavailableValues: string[] = getUnavailableSelectValues(value, options);
  if (!isEmpty(unavailableValues)) {
    return `'select.value' clause for '${fromClause}' queries contains unavailable item(s): ${unavailableValues.join(', ')} [repo: ${options.basePath}]`;
  }
}

function getUnavailableSelectKeys (key: string[], options): string[] {
  return filter(key, (keyItem: string) => {
    const concept = options.conceptsLookup.get(keyItem);
    if (isNil(concept) || !isEntityDomainOrSet(concept.concept_type)) {
      return true;
    }
    return false;
  });
}

function getUnavailableSelectValues (value: string[], options): string[] {
  return filter(value, (valueItem: string) => {
    const concept = options.conceptsLookup.get(valueItem);
    if (isNil(concept) || !isMeasure(concept.concept_type)) {
      return true;
    }
    return false;
  });
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
