export interface IReader {
    recordTransformer: Function;
    setRecordTransformer(recordTransformer: Function): any;
    readText(filePath: string, onFileRead: Function): any;
}
