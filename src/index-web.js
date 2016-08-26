import {Ddf} from './ddf';
import prepareDDFCsvReaderObject from './ddfcsv-reader';
import {FrontendFileReader} from './readers/frontend-file-reader';

module.exports = {
  getDDFCsvReaderObject: prepareDDFCsvReaderObject(new FrontendFileReader()),
  Ddf,
  FrontendFileReader
};
