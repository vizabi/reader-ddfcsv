import { IReader } from '../interfaces';
export declare class GithubFileReader implements IReader {
    recordTransformer: Function;
    setRecordTransformer(recordTransformer: any): void;
    readText(filePath: any, onFileRead: any, options: object): void;
}
