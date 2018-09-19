export interface IReader {
    recordTransformer: Function;
    setRecordTransformer(recordTransformer: Function): any;
    readText(filePath: string, onFileRead: Function): any;
}
export interface IBaseReaderOptions {
    basePath: string;
    conceptsLookup: Map<string, any>;
    datapackage?: object;
    fileReader: IReader;
    logger?: any;
}
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
export interface IResourceSelectionOptimizer {
    isMatched(): boolean;
    getRecommendedFilesSet(): Promise<string[]>;
}
