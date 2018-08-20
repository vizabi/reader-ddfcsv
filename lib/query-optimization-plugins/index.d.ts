import { IQueryOptimizationPlugin } from './query-optimization-plugin';
import { IReader } from '../file-readers/reader';
export declare function getAppropriatePlugin(fileReader: IReader, basePath: string, queryParam: any, datapackage: any): IQueryOptimizationPlugin;
