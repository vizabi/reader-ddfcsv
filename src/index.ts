export {IReader} from './file-readers/reader';
export {Ddf} from './ddf';
import {BackendFileReader} from './file-readers/backend-file-reader';
export {BackendFileReader} from './file-readers/backend-file-reader';
import {GithubFileReader} from './file-readers/github-file-reader';
export {GithubFileReader} from './file-readers/github-file-reader';
import {prepareDDFCsvReaderObject} from './ddfcsv-reader';
export const getDDFCsvReaderObject: Function = prepareDDFCsvReaderObject(new BackendFileReader());
export const getGithubDDFCsvReaderObject: Function = prepareDDFCsvReaderObject(new GithubFileReader());
