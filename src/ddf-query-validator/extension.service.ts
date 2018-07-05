import get = require('lodash/get');
import {
  DEFAULT_DATASET_BRANCH,
  DEFAULT_DATASET_COMMIT,
  DEFAULT_DATASET_DIR,
  DEFAULT_DATASET_NAME
} from './helper.service';
import { IReader } from '../interfaces';

export function getDatasetPath (basePath, queryParam) {
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

function isDatasetPathAlreadyInBasePath (fileReader: IReader, basePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fileReader.readText(getDatapackagePath(basePath), (error) => resolve(!error));
  });
}

export async function extendQueryParamWithDatasetProps (queryParam, options = {}): Promise<string | void> {
  const dataset = get(queryParam, 'dataset', DEFAULT_DATASET_NAME);
  const branch = get(queryParam, 'branch', DEFAULT_DATASET_BRANCH);
  const commit = get(queryParam, 'commit', DEFAULT_DATASET_COMMIT);
  const basePath = get(options, 'basePath', DEFAULT_DATASET_DIR);
  const fileReader = get(options, 'fileReader');
  const datasetName = dataset;
  let datasetPath;
  let datapackagePath;

  try {
    if (await isDatasetPathAlreadyInBasePath(fileReader, basePath)) {
      datasetPath = basePath;
      datapackagePath = getDatapackagePath(basePath);
    } else {
      datasetPath = getDatasetPath(basePath, { dataset, branch, commit });
      datapackagePath = getDatapackagePath(datasetPath);
    }
  } catch (error) {
    throw error;
  }

  Object.assign(queryParam, { dataset, branch, commit });
  Object.assign(options, { datasetPath, datapackagePath, datasetName });

  return queryParam;
}
