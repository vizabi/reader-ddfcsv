import {InClauseUnderConjunctionPlugin} from './in-clause-under-conjunction-plugin';
import head = require('lodash/head');
import {IQueryOptimizationPlugin} from './query-optimization-plugin';
import {IReader} from '../file-readers/reader';

export function getAppropriatePlugin (
  fileReader: IReader,
  basePath: string,
  queryParam,
  datapackage): IQueryOptimizationPlugin {
  const plugins = [
    new InClauseUnderConjunctionPlugin(fileReader, basePath, queryParam, datapackage)
  ];

  return head(plugins.filter(plugin => plugin.isMatched()));
}
