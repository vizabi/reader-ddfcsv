import * as chai from 'chai';
import * as sinon from 'sinon';
import { DdfCsvError, getDDFCsvReaderObject } from '../src/index';
import { BASE_PATH, BROKEN_DATAPACKAGE_PATH, GLOBALIS_PATH, notExpectedError } from './common';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('General errors in ddfcsv reader', () => {
  afterEach(() => sandbox.restore());

  describe('should be processed correctly', () => {
    it(`when 'File not found' happens`, async function() {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      sandbox.stub(reader.fileReader, 'readText').callsArgWithAsync(1, 'file is not found');

      try {
        await reader.read({
          select: {
            key: [ 'concept' ],
            value: [
              'concept_type', 'name'
            ]
          },
          dataset: GLOBALIS_PATH,
          from: 'concepts',
          where: {},
          order_by: [ 'concept' ]
        });
      } catch (error) {
        expect(error.details).to.equal('file is not found');
        expect(error.file).to.equal('./test/fixtures/systema_globalis/master-HEAD/datapackage.json');
        expect(error.name).to.equal('DdfCsvError');
        expect(error).to.be.instanceOf(DdfCsvError);
        expect(error.message).to.equal('File reading error [filepath: ./test/fixtures/systema_globalis/master-HEAD/datapackage.json]. file is not found.');
        return;
      }

      throw new Error(notExpectedError);
    });

    it(`when 'File not found' happens (stubless version)`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: 'foo path/' });
      reader.read({
        select: {
          key: [ 'concept' ],
          value: [
            'concept_type', 'name'
          ]
        },
        dataset: GLOBALIS_PATH,
        from: 'concepts',
        where: {},
        order_by: [ 'concept' ]
      }).catch((error: DdfCsvError) => {
        expect(error.file).to.equal('foo path/systema_globalis/master-HEAD/datapackage.json');
        expect(error.name).to.equal('DdfCsvError');
        expect(error.message).to.equal('File reading error [filepath: foo path/systema_globalis/master-HEAD/datapackage.json]. No such file: foo path/systema_globalis/master-HEAD/datapackage.json.');

        done();
      });
    });

    it(`when 'JSON parsing error' happens`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });
      reader.read({
        select: {
          key: [ 'concept' ],
          value: [
            'concept_type', 'name'
          ]
        },
        dataset: BROKEN_DATAPACKAGE_PATH,
        from: 'concepts',
        where: {},
        order_by: [ 'concept' ]
      }).catch((error: DdfCsvError) => {
        expect(error.file).to.equal('./test/fixtures/ds_broken_datapackage/master-HEAD/datapackage.json');
        expect(error.name).to.equal('DdfCsvError');
        expect(error.message).to.equal('JSON parsing error [filepath: ./test/fixtures/ds_broken_datapackage/master-HEAD/datapackage.json]. Unexpected token ( in JSON at position 0.');
        expect(error.details).to.equal('Unexpected token ( in JSON at position 0');

        done();
      });
    });
  });
});
