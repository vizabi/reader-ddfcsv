export { BackendFileReader } from './file-readers/backend-file-reader';
export { GithubFileReader } from './file-readers/github-file-reader';
export { S3FileReader } from './file-readers/s3-file-reader';
export { DdfCsvError } from './ddfcsv-error';
export declare const getDDFCsvReaderObject: Function;
export declare const getGithubDDFCsvReaderObject: Function;
export declare const getS3FileReaderObject: Function;
export { default as conceptTestCases } from './test-cases/concepts';
export { default as entitiesTestCases } from './test-cases/entities';
