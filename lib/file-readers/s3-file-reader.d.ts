import { IReader } from '../interfaces';
export declare class S3FileReader implements IReader {
    recordTransformer: Function;
    setRecordTransformer(recordTransformer: any): void;
    readText(filePath: any, onFileRead: any, options?: object): void;
}
