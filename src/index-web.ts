export {Ddf} from './ddf';
import {FrontendFileReader} from './file-readers/frontend-file-reader';
export {FrontendFileReader} from './file-readers/frontend-file-reader';
import {prepareDDFCsvReaderObject} from './ddfcsv-reader';
export const getDDFCsvReaderObject: Function = prepareDDFCsvReaderObject(new FrontendFileReader());
