import isEmpty = require('lodash/isEmpty');
import filter = require('lodash/filter');
import map = require('lodash/map');
import get = require('lodash/get');
import compact = require('lodash/compact');
import includes = require('lodash/includes');
import keys = require('lodash/keys');
import startsWith = require('lodash/startsWith');
import isNil = require('lodash/isNil');
import trimStart = require('lodash/trimStart');
import values = require('lodash/values');
import pickBy = require('lodash/pickBy');
import flatMap = require('lodash/flatMap');
import {
  CONCEPT_TYPE_ENTITY_DOMAIN,
  CONCEPT_TYPE_ENTITY_SET,
  CONCEPT_TYPE_TIME,
  isConceptsQuery,
  isDatapointsQuery,
  isEntitiesQuery,
  RESERVED_CONCEPT,
  RESERVED_CONCEPT_TYPE,
  RESERVED_DOMAIN,
  RESERVED_KEY,
  RESERVED_VALUE,
  RESERVED_UNIT,
  RESERVED_DRILL_UP,
} from './helper.service';
import { isPrimitive } from 'util';

export function validateQueryDefinitions (query, options = {}): Promise<string | void> {
  return new Promise((resolve, reject) => {
    const validationResult = [
      ...validateSelectDefinitions(query, options),
      ...validateWhereDefinitions(query, options),
      // ...validateLanguageDefinitions(query, options),
      // ...validateJoinDefinitions(query, options),
      // ...validateOrderByDefinitions(query, options)
    ];

    const isQueryValid = isEmpty(validationResult);

    if (!isQueryValid) {
      return reject(`Too many query definition errors [repo: ${query.dataset}]: \n* ${validationResult.join('\n* ')}`);
    }

    return resolve();
  });
}

function validateSelectDefinitions (query, options): string[] {
  const errorMessages = [];
  const fromClause = get(query, 'from', null);
  const selectClause = get(query, 'select', null);
  const key = get(selectClause, 'key');
  const value = get(selectClause, 'value');
  const ALLOWED_KEYS: string[] = [];
  const ALLOWED_VALUES: string[] = [];
  const { conceptsLookup } = options;

  switch (true) {
    case isDatapointsQuery(query):
      const CONCEPT_TYPES_FOR_DATAPOINTS = [ CONCEPT_TYPE_ENTITY_SET, CONCEPT_TYPE_ENTITY_DOMAIN, CONCEPT_TYPE_TIME ];
      ALLOWED_KEYS.push(...getAllowedConceptGidsByConceptType(CONCEPT_TYPES_FOR_DATAPOINTS, conceptsLookup));
      ALLOWED_VALUES.push(...conceptsLookup.keys());
      break;
    case (isEntitiesQuery(query)):
      const CONCEPT_TYPES_FOR_ENTITIES = [ CONCEPT_TYPE_ENTITY_SET, CONCEPT_TYPE_ENTITY_DOMAIN ];
      ALLOWED_KEYS.push(...getAllowedConceptGidsByConceptType(CONCEPT_TYPES_FOR_ENTITIES, conceptsLookup));
      ALLOWED_VALUES.push(...conceptsLookup.keys());
      break;
    case (isConceptsQuery(query)):
      ALLOWED_KEYS.push(RESERVED_CONCEPT);
      ALLOWED_VALUES.push(...conceptsLookup.keys(), RESERVED_CONCEPT, RESERVED_CONCEPT_TYPE, RESERVED_DOMAIN, RESERVED_UNIT, RESERVED_DRILL_UP);
      break;
    default:
      ALLOWED_KEYS.push(RESERVED_KEY, RESERVED_VALUE);
      ALLOWED_VALUES.push(RESERVED_KEY, RESERVED_VALUE);
      break;
  }

  errorMessages.push(
    checkIfSelectKeyHasInvalidDefinitions(fromClause, key, ALLOWED_KEYS),
    checkIfSelectValueHasInvalidDefinitions(fromClause, value, ALLOWED_VALUES),
  );

  return compact(errorMessages);
}

function validateWhereDefinitions (query, options): string[] {
  const errorMessages = [];
  const whereClause = get(query, 'where', null);
  const fromClause = get(query, 'from', null);
  const selectClause = get(query, 'select', null);
  const key = get(selectClause, 'key');
  const value = get(selectClause, 'value');
  const operators = getWhereOperators(whereClause);
  const { conceptsLookup } = options;

  switch (true) {
    case isDatapointsQuery(query):
      const CONCEPT_TYPES_FOR_DATAPOINTS = [];
      CONCEPT_TYPES_FOR_DATAPOINTS.push(CONCEPT_TYPE_ENTITY_SET, CONCEPT_TYPE_ENTITY_DOMAIN, CONCEPT_TYPE_TIME);
      // const entityDomainsAndSets = pickBy(operators, (operator: string) => {
      //   const concept = conceptsLookup.get(operator);
      //   return includes(CONCEPT_TYPES_FOR_DATAPOINTS, get(concept, 'concept_type'));
      // });
      errorMessages.push(
        // checkIfWhereHasAbsentDefinitions(fromClause, [...keys(operators), ...values(operators)], conceptsLookup),
        // checkIfWhereHasUnavailableDimensionDefinitions(fromClause, keys(entityDomainsAndSets), [...key, ...value]),
        // checkIfWhereHasWrongRelativesDefinitions(fromClause, operators, conceptsLookup),
      );
      break;
    default:
      break;
  }

  return compact(errorMessages);
}

function getWhereOperators (whereClause): object {
  const operators = {};
  getWhereOperatorsRecursively(whereClause, operators);
  return operators;
}

function getWhereOperatorsRecursively (whereClause, operators: object, сandidate?: string) {
  for (const field in whereClause) {
    // no support for deeper object structures (mongo style)
    const hasCandidate = !isNil(сandidate);
    const isCandidate = !hasCandidate && !startsWith(field, '$') && isNaN(+field);
    const [domain, ...set] = field.split('.');

    if (isCandidate) {
      if (isNil(operators[ domain ])) {
        operators[ trimStart(domain, 'is--') ] = [];
      }

      if (!isEmpty(set)) {
        operators[domain].push(trimStart(set.join('.'), 'is--'));
      }
    }

    if (isPrimitive(whereClause[ field ])) {
      continue;
    }

    getWhereOperatorsRecursively(whereClause[ field ], operators, isCandidate ? domain : сandidate);
  }
}

// Common select definitions error
function checkIfSelectKeyHasInvalidDefinitions (fromClause, key, ALLOWED_KEYS) {
  const unavailableKeys: string[] = getUnavailableSelectItems(key, ALLOWED_KEYS);

  if (!isEmpty(unavailableKeys)) {
    return `'select.key' clause for '${fromClause}' query contains unavailable item(s): ${unavailableKeys.join(', ')}`;
  }
}

function checkIfSelectValueHasInvalidDefinitions (fromClause, value, ALLOWED_VALUES) {
  const unavailableValues: string[] = getUnavailableSelectItems(value, ALLOWED_VALUES);

  if (!isEmpty(value) && !isEmpty(unavailableValues)) {
    return `'select.value' clause for '${fromClause}' query contains unavailable item(s): ${unavailableValues.join(', ')}`;
  }
}

// Common where definitions error
function checkIfWhereHasAbsentDefinitions(fromClause, candidates, conceptsLookup): string {
  const unavailableValues: string[] = filter(candidates, (candidate: string) => !conceptsLookup.has(candidate));

  if (!isEmpty(unavailableValues)) {
    return `'where' clause for '${fromClause}' query contains unavailable item(s) that is not present in dataset: ${unavailableValues.join(', ')}`;
  }
}

function checkIfWhereHasUnavailableDimensionDefinitions(fromClause, candidates, select): string {
  const unavailableValues: string[] = filter(candidates, (candidate: string) => !includes(select, candidate));

  if (!isEmpty(unavailableValues)) {
    return `'where' clause for '${fromClause}' query contains item(s) that is not present in 'select': ${unavailableValues.join(', ')}`;
  }
}

function checkIfWhereHasWrongRelativesDefinitions(fromClause, operators, conceptsLookup): string {
  const unavailableValues: string[] = flatMap(operators, (children: string[], parent: string) => {
    const unavailableChildren = map(children, (child: string) => {
      const childConcept = conceptsLookup.get(child);
      return childConcept.domain === parent || childConcept.drill_up === parent ? null : `${parent}.${child}`;
    });
    return unavailableChildren;
  });

  if (!isEmpty(unavailableValues)) {
    return `'where' clause for '${fromClause}' query contains item(s) that has wrong relatives: ${compact(unavailableValues).join(', ')}`;
  }
}

function getUnavailableSelectItems (selectItems: string[], ALLOWED_ITEMS: string[]): string[] {
  return filter(selectItems, (value: string) => !includes(ALLOWED_ITEMS, value));
}

function getAllowedConceptGidsByConceptType (allowedConceptTypes: string[], conceptsLookup): string[] {
  const filteredAllowedConcepts = filter([ ...conceptsLookup.values() ], ({ concept_type }) => includes(allowedConceptTypes, concept_type));
  return map(filteredAllowedConcepts, 'concept');
}
