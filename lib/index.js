"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backend_file_reader_1 = require("./file-readers/backend-file-reader");
var backend_file_reader_2 = require("./file-readers/backend-file-reader");
exports.BackendFileReader = backend_file_reader_2.BackendFileReader;
const github_file_reader_1 = require("./file-readers/github-file-reader");
var github_file_reader_2 = require("./file-readers/github-file-reader");
exports.GithubFileReader = github_file_reader_2.GithubFileReader;
const s3_file_reader_1 = require("./file-readers/s3-file-reader");
var s3_file_reader_2 = require("./file-readers/s3-file-reader");
exports.S3FileReader = s3_file_reader_2.S3FileReader;
var ddfcsv_error_1 = require("./ddfcsv-error");
exports.DdfCsvError = ddfcsv_error_1.DdfCsvError;
const ddfcsv_reader_1 = require("./ddfcsv-reader");
exports.getDDFCsvReaderObject = ddfcsv_reader_1.prepareDDFCsvReaderObject(new backend_file_reader_1.BackendFileReader());
exports.getGithubDDFCsvReaderObject = ddfcsv_reader_1.prepareDDFCsvReaderObject(new github_file_reader_1.GithubFileReader());
exports.getS3FileReaderObject = ddfcsv_reader_1.prepareDDFCsvReaderObject(new s3_file_reader_1.S3FileReader());
//# sourceMappingURL=index.js.map