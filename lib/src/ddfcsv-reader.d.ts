import { IReader } from './interfaces';
export declare function prepareDDFCsvReaderObject(defaultFileReader?: IReader): (externalFileReader?: IReader, logger?: any) => {
    init(readerInfo: any): void;
    getFile(filePath: string, isJsonFile: boolean): Promise<any>;
    getAsset(assetPath: any): Promise<any>;
    read(queryParam: any, parsers: any): Promise<any>;
    _prettifyData(data: any, parsers: any): any;
};
