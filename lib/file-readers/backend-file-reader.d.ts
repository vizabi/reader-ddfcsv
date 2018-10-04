import { IReader } from '../interfaces';
export declare class BackendFileReader implements IReader {
    recordTransformer: Function;
    setRecordTransformer(recordTransformer: any): void;
    readText(filePath: any, onFileRead: any, options: object): any;
}
