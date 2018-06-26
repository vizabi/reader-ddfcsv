import { InClauseUnderConjunctionPlugin } from './in-clause-under-conjunction-plugin';
import { IQueryOptimizationPlugin } from './query-optimization-plugin';
import { IReader } from '../file-readers/reader';
import head = require('lodash/head');

export interface IResource {
  primaryKey: string[] | string;
  resources: string[];
}

export interface IDatapackage {
  ddfSchema: {
    entities: IResource[];
    datapoints: IResource[];
    concepts: IResource[];
  };
}

export interface IPluginOptions {
  fileReader: IReader;
  basePath: string;
  datapackage: IDatapackage;
}

export function getAppropriatePlugin (queryParam, options: IPluginOptions): IQueryOptimizationPlugin {
  const plugins = [
    new InClauseUnderConjunctionPlugin(queryParam, options)
  ];

  return head(plugins.filter(plugin => plugin.isMatched()));
}
