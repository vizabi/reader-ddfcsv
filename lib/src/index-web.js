"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const frontend_file_reader_1 = require("./file-readers/frontend-file-reader");
var frontend_file_reader_2 = require("./file-readers/frontend-file-reader");
exports.FrontendFileReader = frontend_file_reader_2.FrontendFileReader;
var ddfcsv_error_1 = require("./ddfcsv-error");
exports.DdfCsvError = ddfcsv_error_1.DdfCsvError;
const ddfcsv_reader_1 = require("./ddfcsv-reader");
exports.getDDFCsvReaderObject = ddfcsv_reader_1.prepareDDFCsvReaderObject(new frontend_file_reader_1.FrontendFileReader());
//# sourceMappingURL=index-web.js.map