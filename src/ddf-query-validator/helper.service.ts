import get = require('lodash/get');
import includes = require('lodash/includes');
import startsWith = require('lodash/startsWith');

export const SCHEMAS = new Set([ 'concepts.schema', 'entities.schema', 'datapoints.schema' ]);
export const DATAPOINTS = 'datapoints';
export const ENTITIES = 'entities';
export const CONCEPTS = 'concepts';

export const AVAILABLE_QUERY_OPERATORS = new Set([
  '$eq', '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin',
  '$or', '$and', '$not', '$nor', '$size', '$all', '$elemMatch'
]);

export const AVAILABLE_FROM_CLAUSE_VALUES = new Set([
  CONCEPTS, ENTITIES, DATAPOINTS, ...SCHEMAS
]);

export const SORT_DIRECTIONS = new Set([ 'asc', 'desc' ]);
export const MAX_AMOUNT_OF_MEASURES_IN_SELECT = 5;

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

// UTILS

export function isInvalidQueryOperator (operator: string): boolean {
  return startsWith(operator, '$') && !AVAILABLE_QUERY_OPERATORS.has(operator);
}

export function isEntityDomainOrSet (conceptType: string): boolean {
  return includes([ 'entity_domain', 'entity_set', 'time' ], conceptType);
}

export function isMeasure (conceptType: string): boolean {
  return includes([ 'measure', 'string' ], conceptType);
}
