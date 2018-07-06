import get = require('lodash/get');
import includes = require('lodash/includes');

export const SCHEMAS = new Set([ 'concepts.schema', 'entities.schema', 'datapoints.schema', '*.schema' ]);
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

export const AVAILABLE_ORDER_BY_CLAUSE_VALUES = new Set([
  'asc', 'desc', 1, -1
]);

export const DEFAULT_DATASET_NAME = process.env.DEFAULT_DATASET_NAME || 'systema_globalis';
export const DEFAULT_DATASET_BRANCH = process.env.DEFAULT_DATASET_BRANCH || 'master';
export const DEFAULT_DATASET_COMMIT = 'HEAD';
export const DEFAULT_DATASET_DIR = process.env.DEFAULT_DATASET_DIR || './datasets';

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

export function isEntityDomainOrSet (conceptType: string): boolean {
  return includes([ 'entity_domain', 'entity_set', 'time' ], conceptType);
}

export function isMeasure (conceptType: string): boolean {
  return includes([ 'measure', 'string' ], conceptType);
}
