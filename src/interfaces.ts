export interface IReader {
  recordTransformer: Function;
  setRecordTransformer(recordTransformer: Function);
  readText(filePath: string, onFileRead: Function);
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

export interface IQueryOptimizationPlugin {
  isMatched(): boolean;

  getOptimalFilesSet(): Promise<string[]>;
}
