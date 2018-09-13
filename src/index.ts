import { BackendFileReader } from './file-readers/backend-file-reader';
export { BackendFileReader } from './file-readers/backend-file-reader';

import { GithubFileReader } from './file-readers/github-file-reader';
export { GithubFileReader } from './file-readers/github-file-reader';

import { S3FileReader } from './file-readers/s3-file-reader';
export { S3FileReader } from './file-readers/s3-file-reader';

export { DdfCsvError } from './ddfcsv-error';

import { prepareDDFCsvReaderObject } from './ddfcsv-reader';

export const getDDFCsvReaderObject: Function = prepareDDFCsvReaderObject(new BackendFileReader());
export const getGithubDDFCsvReaderObject: Function = prepareDDFCsvReaderObject(new GithubFileReader());
export const getS3FileReaderObject: Function = prepareDDFCsvReaderObject(new S3FileReader());
