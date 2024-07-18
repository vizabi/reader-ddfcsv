// The file was separated because the web version of DDFCSV reader shouldn't have any dependency from core nodejs
// such as fs, path, etc
import { FrontendFileReader } from './file-readers/frontend-file-reader';

export { FrontendFileReader } from './file-readers/frontend-file-reader';
import { DdfCsvError } from './ddfcsv-error';

export { DdfCsvError } from './ddfcsv-error';
import { prepareDDFCsvReaderObject } from './ddfcsv-reader';

export const getDDFCsvReaderObject: Function = prepareDDFCsvReaderObject(new FrontendFileReader());

const __VERSION = '';
const __BUILD = '';
const __PACKAGE_JSON_FIELDS = '';
export const versionInfo = { version: __VERSION, build: __BUILD, package: __PACKAGE_JSON_FIELDS };
export const version = __VERSION;