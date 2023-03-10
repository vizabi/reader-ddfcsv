import { DiagnosticManager } from 'cross-project-diagnostics';

export interface IResourceRead {
  recordTransformer: Function;
  setRecordTransformer(recordTransformer: Function);
  readText(filePath: string, onFileRead: Function, options?: object);
  checkFile(path: string);
}

export interface IBaseReaderOptions {
  basePath: string;
  conceptsLookup: Map<string, any>;
  datapackage?: any;
  fileReader: IResourceRead;
  logger?: any;
  diagnostic?: DiagnosticManager;
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

export interface IResourceSelectionOptimizer {
  isMatched(): boolean;

  getRecommendedFilesSet(): Promise<string[]>;
}
