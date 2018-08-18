import { IQueryOptimizationPlugin } from './query-optimization-plugin';
import { IReader } from '../file-readers/reader';
export declare class InClauseUnderConjunctionPlugin implements IQueryOptimizationPlugin {
    private fileReader;
    private basePath;
    private query;
    private datapackage;
    private flow;
    constructor(fileReader: IReader, basePath: string, query: any, datapackage: any);
    isMatched(): boolean;
    getOptimalFilesSet(): Promise<string[]>;
    private fillResourceToFileHash();
    private collectProcessableClauses();
    private collectEntityFilesNames();
    private collectEntities();
    private fillEntityValuesHash(entitiesData);
    private getFilesGroupsQueryClause();
    private getOptimalFilesGroup();
    private getProcessableClauses(clause);
    private singleAndField(clause);
}
