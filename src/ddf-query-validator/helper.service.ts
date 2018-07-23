import get = require('lodash/get');
import includes = require('lodash/includes');

export const SCHEMAS = new Set([ 'concepts.schema', 'entities.schema', 'datapoints.schema', '*.schema' ]);
export const DATAPOINTS = 'datapoints';
export const ENTITIES = 'entities';
export const CONCEPTS = 'concepts';

export const CONCEPT_TYPE_MEASURE = 'measure';
export const CONCEPT_TYPE_STRING = 'string';
export const CONCEPT_TYPE_ENTITY_DOMAIN = 'entity_domain';
export const CONCEPT_TYPE_ENTITY_SET = 'entity_set';
export const CONCEPT_TYPE_TIME = 'time';

export const RESERVED_CONCEPT = 'concept';
export const RESERVED_CONCEPT_TYPE = 'concept_type';
export const RESERVED_DOMAIN = 'domain';
export const RESERVED_UNIT = 'unit';
export const RESERVED_DRILL_UP = 'drill_up';
export const RESERVED_KEY = 'key';
export const RESERVED_VALUE = 'value';

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

export function isEntityDomainOrSet (conceptType: string, allowedValues: string[]): boolean {
  return includes(allowedValues, conceptType);
}

export function isMeasure (conceptType: string): boolean {
  return includes([ CONCEPT_TYPE_MEASURE ], conceptType);
}

export function isIndicator (conceptType: string): boolean {
  return includes([ CONCEPT_TYPE_MEASURE, CONCEPT_TYPE_STRING ], conceptType);
}
