import isEmpty = require('lodash/isEmpty');
import isNil = require('lodash/isNil');
import isObject = require('lodash/isObject');
import isArray = require('lodash/isArray');
import size = require('lodash/size');
import values = require('lodash/values');
import keys = require('lodash/keys');
import map = require('lodash/map');
import first = require('lodash/first');
import filter = require('lodash/filter');
import startsWith = require('lodash/startsWith');
import get = require('lodash/get');
import has = require('lodash/has');
import every = require('lodash/every');
import compact = require('lodash/compact');
import isString = require('lodash/isString');
import {
  DEFAULT_DATASET_NAME,
  AVAILABLE_FROM_CLAUSE_VALUES,
  AVAILABLE_ORDER_BY_CLAUSE_VALUES,
  AVAILABLE_QUERY_OPERATORS,
  isConceptsQuery,
  isDatapointsQuery,
  isEntitiesQuery,
  isSchemaQuery, DEFAULT_DATASET_BRANCH, DEFAULT_DATASET_COMMIT
} from './helper.service';
import { isPrimitive } from 'util';

export function validateQueryStructure (query, options = {}): Promise<string | void> {
  return new Promise((resolve, reject) => {
    const validationResult = [
      ...validateDatasetStructure(query, options),
      ...validateFromStructure(query, options),
      ...validateSelectStructure(query, options),
      ...validateWhereStructure(query, options),
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

function validateDatasetStructure(query, options): string[] {
  const errorMessages = [];
  const datasetClause = get(query, 'dataset');
  const branchClause = get(query, 'branch');
  const commitClause = get(query, 'commit');

  if (!isNil(datasetClause) && !isString(datasetClause)) {
    errorMessages.push(`'dataset' clause must be string only`);
  }

  if (!isNil(branchClause) && !isString(branchClause)) {
    errorMessages.push(`'branch' clause must be string only`);
  }

  if (!isNil(commitClause) && !isString(commitClause)) {
    errorMessages.push(`'commit' clause must be string only`);
  }

  return errorMessages;
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
        checkIfSchemasSelectKeyHasInvalidStructure(fromClause, key),
        checkIfSelectValueHasInvalidStructure(fromClause, value),
      );
      break;
    case (isEntitiesQuery(query)):
      errorMessages.push(
        checkIfSelectIsEmpty(selectClause),
        checkIfEntitiesOrConceptsSelectHasInvalidStructure(selectClause, key, value),
        checkIfSelectKeyHasInvalidStructure(fromClause, key),
        checkIfSelectValueHasInvalidStructure(fromClause, value),
      );
      break;
    case (isConceptsQuery(query)):
      errorMessages.push(
        checkIfSelectIsEmpty(selectClause),
        checkIfEntitiesOrConceptsSelectHasInvalidStructure(selectClause, key, value),
        checkIfSelectKeyHasInvalidStructure(fromClause, key),
        checkIfSelectValueHasInvalidStructure(fromClause, value),
      );
      break;
    case (isDatapointsQuery(query)):
      errorMessages.push(
        checkIfSelectIsEmpty(selectClause),
        checkIfSelectHasInvalidStructure(selectClause, key, value),
        checkIfDatapointsSelectKeyHasInvalidStructure(fromClause, key),
        checkIfDatapointsSelectValueHasInvalidStructure(fromClause, value),
      );
      break;
    default:
      errorMessages.push(
        checkIfSelectIsEmpty(selectClause),
      );
      break;
  }

  return compact(errorMessages);
}

function validateWhereStructure (query, options): string[] {
  const errorMessages = [];
  const joinClause = get(query, 'join', null);
  const whereClause = get(query, 'where', null);
  const whereOperators = getWhereOperators(whereClause);

  errorMessages.push(
    checkIfWhereHasInvalidStructure(whereClause, getJoinIDPathIfExists(options)),
    checkIfWhereHasUnknownOperators(joinClause, whereOperators, getJoinIDPathIfExists(options)),
  );

  return compact(errorMessages);
}

function validateLanguageStructure (query, options): string[] {
  const errorMessages = [];
  const languageClause = get(query, 'language', null);

  switch (true) {
    case (isSchemaQuery(query)):
      errorMessages.push(
        checkIfSchemaLanguageIsPresent(query),
      );
      break;
    case (isEntitiesQuery(query)):
    case (isConceptsQuery(query)):
    case (isDatapointsQuery(query)):
    default:
      errorMessages.push(
        checkIfLanguageHasInvalidStructure(languageClause),
      );
      break;
  }

  return compact(errorMessages);
}

function validateJoinStructure (query, options): string[] {
  const errorMessages = [];
  const joinClause = get(query, 'join', null);

  switch (true) {
    case (isSchemaQuery(query)):
    case (isConceptsQuery(query)):
      errorMessages.push(
        checkIfSchemaJoinIsPresent(query),
      );
      break;
    case (isEntitiesQuery(query)):
    case (isDatapointsQuery(query)):
    default:
      errorMessages.push(
        checkIfJoinHasInvalidStructure(joinClause),
        ...map(joinClause, (item, joinID) => checkIfJoinKeyHasInvalidStructure(item, getJoinIDPathIfExists({joinID})))
      );
      break;
  }

  return compact(errorMessages);
}

function validateOrderByStructure (query, options): string[] {
  const errorMessages = [];
  const orderByClause = get(query, 'order_by', null);

  errorMessages.push(
    checkIfOrderByHasInvalidStructure(orderByClause),
  );

  return compact(errorMessages);
}

// Common structure errors
function checkIfSelectIsEmpty (selectClause): string | void {
  if (isNil(selectClause)) {
    return `'select' clause couldn't be empty`;
  }
}

function checkIfSelectHasInvalidStructure (selectClause, key, value): string | void {
  if (!isObject(selectClause) || !isArray(key) || !isArray(value)) {
    return `'select' clause must have next structure: { key: [...], value: [...] }`;
  }
}

function checkIfJoinHasInvalidStructure (joinClause): string | void {
  if (!isNil(joinClause) && !isStrictObject(joinClause)) {
    return `'join' clause must be object only`;
  }
}

function checkIfLanguageHasInvalidStructure (languageClause): string | void {
  if (!isNil(languageClause) && !isString(languageClause)) {
    return `'language' clause must be string only`;
  }
}

function checkIfJoinKeyHasInvalidStructure (joinClause, joinPath: string): string | void {
  if (!isNil(joinClause.key) && !isString(joinClause.key)) {
    return `'${joinPath}key' clause must be string only`;
  }
}

function checkIfWhereHasInvalidStructure (whereClause, joinPath: string): string | void {
  if (!isNil(whereClause) && !isStrictObject(whereClause)) {
    return `'${joinPath}where' clause must be object only`;
  }
}

function checkIfWhereHasUnknownOperators (joinClause, operators, joinPath: string): string | void {
  const notAllowedOperators = filter(operators, (operator) => !isAllowedOperator(joinClause, operator)).map((operator) => operator.name);
  const allowedOperatorsByDataset = [ ...AVAILABLE_QUERY_OPERATORS.values(), ...keys(joinClause) ];

  if (!isEmpty(notAllowedOperators)) {
    return `'${joinPath}where' clause has unknown operator(s) '${notAllowedOperators.join(', ')}', replace it with allowed operators: ${allowedOperatorsByDataset.join(', ')}`;
  }

}

function checkIfOrderByHasInvalidStructure (orderByClause): string | void {
  if (!isNil(orderByClause) && !isString(orderByClause) && !isArrayOfStrings(orderByClause) && !isArrayOfSpecialItems(orderByClause, isOrderBySubclause)) {
    return `'order_by' clause must be string or array of strings || objects only`;
  }
}

function isStrictObject (clause): boolean {
  return isObject(clause) && !isArray(clause);
}

function isArrayOfStrings (clause): boolean {
  return isArray(clause) && every(clause, isString);
}

function isOrderBySubclause (subclause) {
  return isString(subclause) || (isStrictObject(subclause) && size(subclause) === 1 && AVAILABLE_ORDER_BY_CLAUSE_VALUES.has(first(values(subclause))));
}

function isArrayOfSpecialItems (clause, isSpecialItem): boolean {
  return isArray(clause) && every(clause, isSpecialItem);
}

function isAllowedOperator (joinClause, operator) {
  return isMongoLikeOperator(operator) || isJoinOperator(joinClause, operator);
}

function isMongoLikeOperator (operator) {
  return !operator.isLeaf && AVAILABLE_QUERY_OPERATORS.has(operator.name);
}

function isJoinOperator (joinClause, operator) {
  return operator.isLeaf && startsWith(operator.name, '$') && has(joinClause, operator.name);
}

function getJoinIDPathIfExists(options) {
  return get(options, 'joinID', false) ? `join.${options.joinID}.` : '';
}

function getWhereOperators (whereClause): string[] {
  const operators = [];

  for (const field in whereClause) {
    // no support for deeper object structures (mongo style)

    if (startsWith(field, '$')) {
      operators.push({ name: field, isLeaf: false });
    }

    if (isPrimitive(whereClause[ field ])) {
      if (startsWith(whereClause[ field ], '$')) {
        operators.push({ name: whereClause[ field ], isLeaf: true });
      }
    } else {
      operators.push(...getWhereOperators(whereClause[ field ]));
    }
  }

  return operators;
}

// * specific datapoints select errors
function checkIfDatapointsSelectKeyHasInvalidStructure (fromClause, key): string | void {
  if (size(key) < 2) {
    return `'select.key' clause for '${fromClause}' queries must have at least 2 items`;
  }
}

function checkIfDatapointsSelectValueHasInvalidStructure (fromClause, value): string | void {
  if (size(value) < 1) {
    return `'select.value' clause for '${fromClause}' queries must have at least 1 item`;
  }
}

// * specific schemas select errors
function checkIfSchemasSelectKeyHasInvalidStructure (fromClause, key): string | void {
  if (!isArray(key) || size(key) !== 2) {
    return `'select.key' clause for '${fromClause}' queries must have exactly 2 items: 'key', 'value'`;
  }
}

function checkIfSelectValueHasInvalidStructure (fromClause, value): string | void {
  if (!isArray(value) && !isNil(value)) {
    return `'select.value' clause for '${fromClause}' queries should be array of strings or empty`;
  }
}

function checkIfSchemaJoinIsPresent (query): string | void {
  if (has(query, 'join')) {
    return `'join' clause for '${query.from}' queries shouldn't be present in query`;
  }
}

function checkIfSchemaLanguageIsPresent (query): string | void {
  if (has(query, 'language')) {
    return `'language' clause for '*.schema' queries shouldn't be present in query`;
  }
}

// * specific concepts/entities select errors
function checkIfEntitiesOrConceptsSelectHasInvalidStructure (selectClause, key, value): string | void {
  if (!isObject(selectClause) || !isArray(key)) {
    return `'select' clause must have next structure: { key: [...], value: [...] }`;
  }
}

function checkIfSelectKeyHasInvalidStructure (fromClause, key): string | void {
  if (!isArray(key) || size(key) !== 1) {
    return `'select.key' clause for '${fromClause}' queries must have only 1 item`;
  }
}
