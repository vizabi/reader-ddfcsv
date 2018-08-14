import { IReader } from './interfaces';
export declare function prepareDDFCsvReaderObject(defaultFileReader?: IReader): (externalFileReader?: IReader, logger?: any) => {
    init(readerInfo: any): void;
    getAsset(asset: any): Promise<{}>;
    read(queryParam: any, parsers: any): Promise<any>;
    _prettifyData(data: any, parsers: any): any;
};
