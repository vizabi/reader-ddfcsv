"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_READING_ERROR = 'File reading error';
exports.JSON_PARSING_ERROR = 'JSON parsing error';
exports.CSV_PARSING_ERROR = 'CSV parsing error';
exports.DDF_ERROR = 'DDF error';
class DdfCsvError extends Error {
    constructor(message, details, file) {
        super();
        this.name = 'DdfCsvError';
        this.message = `${message} [filepath: ${file}]. ${details}.`;
        this.details = details;
        this.file = file;
    }
}
exports.DdfCsvError = DdfCsvError;
//# sourceMappingURL=ddfcsv-error.js.map