import {Ddf} from './ddf';
import {BackendFileReader} from './readers/backend-file-reader';
import prepareDDFCsvReaderObject from './ddfcsv-reader';

module.exports = {
  getDDFCsvReaderObject: prepareDDFCsvReaderObject(new BackendFileReader()),
  Ddf,
  BackendFileReader
};
