import * as chai from 'chai';
import * as sinon from 'sinon';
import { getDDFCsvReaderObject, DdfCsvError } from '../src/index';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const BROKEN_DATAPACKAGE_PATH = './test/fixtures/ds_broken_datapackage';

describe('Errors in ddfcsv reader', () => {
  afterEach(() => sandbox.restore());

  describe('should be processed correctly', () => {
    it(`when 'File not found' happens`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({path: GLOBALIS_PATH});

      sandbox.stub(reader.fileReader, 'readText').callsArgWithAsync(1, 'file is not found');

      reader.read({
        select: {
          key: ['concept'],
          value: [
            'concept_type', 'name'
          ]
        },
        from: 'concepts',
        where: {},
        order_by: ['concept']
      }).catch((error: DdfCsvError) => {
        expect(error.details).to.equal('file is not found');
        expect(error.file).to.equal('./test/fixtures/systema_globalis/ddf--concepts.csv');
        expect(error.name).to.equal('DdfCsvError');
        expect(error.message).to.equal('File reading error [filepath: ./test/fixtures/systema_globalis/ddf--concepts.csv]. file is not found.');

        done();
      });
    });

    it(`when 'File not found' happens (stubless version)`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({path: 'foo path'});
      reader.read({
        select: {
          key: ['concept'],
          value: [
            'concept_type', 'name'
          ]
        },
        from: 'concepts',
        where: {},
        order_by: ['concept']
      }).catch((error: DdfCsvError) => {
        expect(error.file).to.equal('foo path/datapackage.json');
        expect(error.name).to.equal('DdfCsvError');
        expect(error.message).to.equal('File reading error [filepath: foo path/datapackage.json]. No such file: foo path/datapackage.json.');

        done();
      });
    });

    it(`when 'JSON parsing error' happens`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({path: BROKEN_DATAPACKAGE_PATH});
      reader.read({
        select: {
          key: ['concept'],
          value: [
            'concept_type', 'name'
          ]
        },
        from: 'concepts',
        where: {},
        order_by: ['concept']
      }).catch((error: DdfCsvError) => {
        expect(error.file).to.equal('./test/fixtures/ds_broken_datapackage/datapackage.json');
        expect(error.name).to.equal('DdfCsvError');
        expect(error.message).to.equal('JSON parsing error [filepath: ./test/fixtures/ds_broken_datapackage/datapackage.json]. Unexpected token ( in JSON at position 0.');
        expect(error.details).to.equal('Unexpected token ( in JSON at position 0');

        done();
      });
    });
  });
});
