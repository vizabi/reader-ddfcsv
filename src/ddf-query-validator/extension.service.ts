import trim = require('lodash/trim');
import get = require('lodash/get');
import {
  DEFAULT_DATASET_BRANCH,
  DEFAULT_DATASET_COMMIT, DEFAULT_DATASET_NAME,
  isConceptsQuery,
  isDatapointsQuery,
  isEntitiesQuery,
  isEntityDomainOrSet,
  isMeasure,
  isSchemaQuery
} from './helper.service';

function getDatasetPath (basePath, queryParam) {
  const {
    dataset,
    branch,
    commit
  } = queryParam;
  // return `${dataset}${branch ? '/' + branch : ''}${commit && branch ? '-' + commit : ''}`;
  return `${basePath}/${dataset}`;
}

function getDatapackagePath (datasetPath): string {
  return datasetPath + '/datapackage.json';
}

export function extendQueryParamWithDatasetProps (queryParam, options = {}): Promise<string | void> {
  const dataset = get(queryParam, 'dataset', DEFAULT_DATASET_NAME);
  const branch = get(queryParam, 'branch', DEFAULT_DATASET_BRANCH);
  const commit = get(queryParam, 'commit', DEFAULT_DATASET_COMMIT);
  const basePath = trim(get(options, 'basePath', ''), '/');
  const datasetPath = getDatasetPath(basePath, {dataset, branch, commit});
  const datapackagePath = getDatapackagePath(datasetPath);

  Object.assign(queryParam, {dataset, branch, commit, datasetPath, datapackagePath});

  return new Promise((resolve, reject) => {
    return resolve(queryParam);
  });
}
