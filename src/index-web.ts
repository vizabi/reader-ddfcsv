import {FrontendFileReader} from './file-readers/frontend-file-reader';
export {FrontendFileReader} from './file-readers/frontend-file-reader';
import {DdfCsvError} from './ddfcsv-error';
export {DdfCsvError} from './ddfcsv-error';
import {prepareDDFCsvReaderObject} from './ddfcsv-reader';
export const getDDFCsvReaderObject: Function = prepareDDFCsvReaderObject(new FrontendFileReader());
