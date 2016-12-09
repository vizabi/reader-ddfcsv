export interface IReader {
  setRecordTransformer(recordTransformer: Function);
  readCSV(filePath: string, onFileRead: Function);
  readJSON(filePath: string, onFileRead: Function);
  getFileSchema(filePath: string, onFileRead: Function);
}
