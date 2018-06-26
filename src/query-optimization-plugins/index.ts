import { InClauseUnderConjunctionPlugin } from './in-clause-under-conjunction-plugin';
import head = require('lodash/head');
import { IPluginOptions, IQueryOptimizationPlugin } from '../interfaces';

export function getAppropriatePlugin (queryParam, options: IPluginOptions): IQueryOptimizationPlugin {
  const plugins = [
    new InClauseUnderConjunctionPlugin(queryParam, options)
  ];

  return head(plugins.filter(plugin => plugin.isMatched()));
}
