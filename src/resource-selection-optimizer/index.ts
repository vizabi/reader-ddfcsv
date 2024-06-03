import { InClauseUnderConjunction } from './in-clause-under-conjunction';
import * as head from 'lodash.head';
import { IBaseReaderOptions, IResourceSelectionOptimizer } from '../interfaces';

export function getAppropriatePlugin(parent, queryParam, options: IBaseReaderOptions): IResourceSelectionOptimizer {
  const plugins = [
    new InClauseUnderConjunction(parent, queryParam, options)
  ];

  return head(plugins.filter(plugin => plugin.isMatched()));
}
