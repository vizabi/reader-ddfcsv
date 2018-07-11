import isNil = require('lodash/isNil');
import includes = require('lodash/includes');
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
  const datasetsConfig = get(options, 'datasetsConfig', {
    [DEFAULT_DATASET_NAME]: {[DEFAULT_DATASET_BRANCH]: [DEFAULT_DATASET_COMMIT]},
    default: {
      dataset: DEFAULT_DATASET_NAME,
      branch: DEFAULT_DATASET_BRANCH,
      commit: DEFAULT_DATASET_COMMIT
    }
  });

  const {
    'default': {
      dataset: DEFAULT_DATASET,
      branch: DEFAULT_BRANCH,
      commit: DEFAULT_COMMIT
    }
  } = datasetsConfig;
  const {
    dataset: originDataset,
    branch: originBranch,
    commit: originCommit
  } = queryParam;
  const {
    dataset = DEFAULT_DATASET,
    branch = DEFAULT_BRANCH,
    commit = DEFAULT_COMMIT
  } = queryParam;

  const basePath = get(options, 'basePath', DEFAULT_DATASET_DIR);
  const fileReader = get(options, 'fileReader');
  const datasetName = dataset;

  if (isNil(datasetsConfig[dataset])) {
    throw new Error(`No ${isNil(originDataset) ? 'default ' : ''}dataset '${dataset}' was found`);
  }

  if (isNil(datasetsConfig[dataset][branch])) {
    throw new Error(`No ${isNil(originBranch) ? 'default ' : ''}branch '${branch}' in ${isNil(originDataset) ? 'default ' : ''}dataset '${dataset}' was found`);
  }

  if (!includes(datasetsConfig[dataset][branch], commit)) {
    throw new Error(`No ${isNil(originCommit) ? 'default ' : ''}commit '${commit}' in ${isNil(originBranch) ? 'default ' : ''}branch '${branch}' in ${isNil(originDataset) ? 'default ' : ''}dataset '${dataset}' was found`);
  }

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
