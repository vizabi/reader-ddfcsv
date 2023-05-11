import { BackendFileReader } from './file-readers/backend-file-reader';

export { BackendFileReader } from './file-readers/backend-file-reader';

export { DdfCsvError } from './ddfcsv-error';

import { IResourceRead } from './interfaces';

export { IResourceRead } from './interfaces';

import { prepareDDFCsvReaderObject } from './ddfcsv-reader';

export { prepareDDFCsvReaderObject } from './ddfcsv-reader';

export const getDDFCsvReaderObject: Function = prepareDDFCsvReaderObject(new BackendFileReader());
