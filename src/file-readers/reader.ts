export interface IReader {
  recordTransformer: Function;
  setRecordTransformer(recordTransformer: Function);
  readText(filePath: string, onFileRead: Function);
}
