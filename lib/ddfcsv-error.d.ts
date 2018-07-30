export declare const FILE_READING_ERROR = "File reading error";
export declare const JSON_PARSING_ERROR = "JSON parsing error";
export declare const CSV_PARSING_ERROR = "CSV parsing error";
export declare const DDF_ERROR = "DDF error";
export declare class DdfCsvError extends Error {
    details: any;
    file: string | null;
    stack: string;
    name: string;
    message: string;
    constructor(message: string, details: any, file?: string);
}
