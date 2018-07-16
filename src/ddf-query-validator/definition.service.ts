import isEmpty = require('lodash/isEmpty');
import filter = require('lodash/filter');
import map = require('lodash/map');
import get = require('lodash/get');
import compact = require('lodash/compact');
import includes = require('lodash/includes');
import {
  CONCEPT_TYPE_ENTITY_DOMAIN,
  CONCEPT_TYPE_ENTITY_SET,
  CONCEPT_TYPE_TIME, CONCEPTS, DATAPOINTS, ENTITIES,
  isConceptsQuery,
  isDatapointsQuery,
  isEntitiesQuery,
  isEntityDomainOrSet, isIndicator,
  isMeasure,
  isSchemaQuery,
  RESERVED_CONCEPT, RESERVED_CONCEPT_TYPE, RESERVED_DOMAIN, RESERVED_KEY, RESERVED_VALUE,
} from './helper.service';

export function validateQueryDefinitions (query, options = {}): Promise<string | void> {
  return new Promise((resolve, reject) => {
    const validationResult = [
      ...validateSelectDefinitions(query, options),
      // ...validateWhereDefinitions(query, options),
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
  const {conceptsLookup} = options;

  switch (true) {
    case isDatapointsQuery(query):
      const CONCEPT_TYPES_FOR_DATAPOINTS = [CONCEPT_TYPE_ENTITY_SET, CONCEPT_TYPE_ENTITY_DOMAIN, CONCEPT_TYPE_TIME];
      ALLOWED_KEYS.push(...getAllowedConceptGidsByConceptType(CONCEPT_TYPES_FOR_DATAPOINTS, conceptsLookup));
      ALLOWED_VALUES.push(...conceptsLookup.keys());
      break;
    case (isEntitiesQuery(query)):
      const CONCEPT_TYPES_FOR_ENTITIES = [CONCEPT_TYPE_ENTITY_SET, CONCEPT_TYPE_ENTITY_DOMAIN];
      ALLOWED_KEYS.push(...getAllowedConceptGidsByConceptType(CONCEPT_TYPES_FOR_ENTITIES, conceptsLookup));
      ALLOWED_VALUES.push(...conceptsLookup.keys());
      break;
    case (isConceptsQuery(query)):
      ALLOWED_KEYS.push(RESERVED_CONCEPT);
      ALLOWED_VALUES.push(...conceptsLookup.keys(), RESERVED_CONCEPT, RESERVED_CONCEPT_TYPE, RESERVED_DOMAIN);
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

// Common select definitions error
function checkIfSelectKeyHasInvalidDefinitions(fromClause, key, ALLOWED_KEYS) {
  const unavailableKeys: string[] = getUnavailableSelectItems(key, ALLOWED_KEYS);

  if (!isEmpty(unavailableKeys)) {
    return `'select.key' clause for '${fromClause}' query contains unavailable item(s): ${unavailableKeys.join(', ')}`;
  }
}

function checkIfSelectValueHasInvalidDefinitions(fromClause, value, ALLOWED_VALUES) {
  const unavailableValues: string[] = getUnavailableSelectItems(value, ALLOWED_VALUES);

  if (!isEmpty(value) && !isEmpty(unavailableValues)) {
    return `'select.value' clause for '${fromClause}' query contains unavailable item(s): ${unavailableValues.join(', ')}`;
  }
}

function getUnavailableSelectItems (selectItems: string[], ALLOWED_ITEMS: string[]): string[] {
  return filter(selectItems, (value: string) => !includes(ALLOWED_ITEMS, value));
}

function getAllowedConceptGidsByConceptType (allowedConceptTypes: string[], conceptsLookup): string[] {
  const filteredAllowedConcepts = filter([...conceptsLookup.values()], ({concept_type}) => includes(allowedConceptTypes, concept_type));
  return map(filteredAllowedConcepts, 'concept');
}
