import get = require('lodash/get');
import {
  DEFAULT_DATASET_BRANCH,
  DEFAULT_DATASET_COMMIT,
  DEFAULT_DATASET_DIR,
  DEFAULT_DATASET_NAME
} from './helper.service';

function getDatasetPath (basePath, queryParam) {
  const {
    dataset,
    branch,
    commit
  } = queryParam;
  return `${basePath}${dataset}/${branch}-${commit}`;
}

function getDatapackagePath (datasetPath): string {
  return datasetPath + '/datapackage.json';
}

export function extendQueryParamWithDatasetProps (queryParam, options = {}): Promise<string | void> {
  const dataset = get(queryParam, 'dataset',   process.env.DEFAULT_DATASET_NAME || DEFAULT_DATASET_NAME);
  const branch = get(queryParam, 'branch',  process.env.DEFAULT_DATASET_BRANCH || DEFAULT_DATASET_BRANCH);
  const commit = get(queryParam, 'commit', process.env.DEFAULT_DATASET_COMMIT || DEFAULT_DATASET_COMMIT);
  const basePath = get(options, 'basePath', DEFAULT_DATASET_DIR);
  const datasetName = dataset;
  const datasetPath = getDatasetPath(basePath, { dataset, branch, commit });
  const datapackagePath = getDatapackagePath(datasetPath);

  Object.assign(queryParam, { dataset, branch, commit });
  Object.assign(options, { datasetPath, datapackagePath, datasetName });

  return queryParam;
}
