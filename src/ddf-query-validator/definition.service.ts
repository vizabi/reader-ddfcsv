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
      return reject(`Too many query definition errors: \n* ${validationResult.join('\n* ')}`);
    }

    return resolve();
  });
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

// Common select definitions error
function checkIfSelectKeyHasInvalidDefinitions (fromClause, key, options): string | void {
  const unavailableKeys: string[] = getUnavailableSelectKeys(key, options);
  if (!isEmpty(unavailableKeys)) {
    return `'select.key' clause for '${fromClause}' queries contains unavailable item(s): ${unavailableKeys.join(', ')} [repo: ${options.basePath}]`;
  }
}

function checkIfSelectValueHasInvalidDefinitions (fromClause, value, options): string | void {
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
