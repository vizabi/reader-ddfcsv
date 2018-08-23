import { IResourceSelectionOptimizer } from '../interfaces';
export declare class InClauseUnderConjunction implements IResourceSelectionOptimizer {
    private flow;
    private fileReader;
    private datasetPath;
    private query;
    private datapackage;
    private conceptsLookup;
    constructor(queryParam: any, options: any);
    isMatched(): boolean;
    getRecommendedFilesSet(): Promise<string[]>;
    private fillResourceToFileHash;
    private collectProcessableClauses;
    private collectEntityFilesNames;
    private collectEntities;
    private fillEntityValuesHash;
    private getFilesGroupsQueryClause;
    private getOptimalFilesGroup;
    private getProcessableClauses;
    private singleAndField;
}
