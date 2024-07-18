import { BackendFileReader } from './file-readers/backend-file-reader';

export { BackendFileReader } from './file-readers/backend-file-reader';

export { DdfCsvError } from './ddfcsv-error';

import { IResourceRead } from './interfaces';

export { IResourceRead } from './interfaces';

import { prepareDDFCsvReaderObject } from './ddfcsv-reader';

export { prepareDDFCsvReaderObject } from './ddfcsv-reader';

export const getDDFCsvReaderObject: Function = prepareDDFCsvReaderObject(new BackendFileReader());

const __VERSION = '';
const __BUILD = '';
const __PACKAGE_JSON_FIELDS = '';
export const versionInfo = { version: __VERSION, build: __BUILD, package: __PACKAGE_JSON_FIELDS };
export const version = __VERSION;