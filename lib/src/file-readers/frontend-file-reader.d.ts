import { IReader } from '../interfaces';
export declare class FrontendFileReader implements IReader {
    recordTransformer: Function;
    setRecordTransformer(recordTransformer: any): void;
    readText(filePath: any, onFileRead: any): void;
}
