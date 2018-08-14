import { InClauseUnderConjunction } from './in-clause-under-conjunction';
import * as head from 'lodash.head';
import { IPluginOptions, IResourceSelectionOptimizer } from '../interfaces';

export function getAppropriatePlugin(queryParam, options: IPluginOptions): IResourceSelectionOptimizer {
  const plugins = [
    new InClauseUnderConjunction(queryParam, options)
  ];

  return head(plugins.filter(plugin => plugin.isMatched()));
}
