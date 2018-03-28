import * as chai from 'chai';
import * as sinon from 'sinon';
import { getDDFCsvReaderObject, DdfCsvError } from '../src/index';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const BROKEN_DATAPACKAGE_PATH = './test/fixtures/ds_broken_datapackage';

describe('Errors processing', () => {
  afterEach(() => sandbox.restore());

  it(`'File not found' should be processed correctly`, done => {
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
      expect(error.message).to.equal('File reading error');

      done();
    });
  });

  it(`'File not found' should be processed correctly (stubless version)`, done => {
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
      expect(error.message).to.equal('File reading error');
      expect(error.details.message).to.equal(`ENOENT: no such file or directory, open 'foo path/datapackage.json'`);

      done();
    });
  });

  it(`'JSON parsing error' should be processed correctly`, done => {
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
      expect(error.message).to.equal('JSON parsing error');
      expect(error.details.message).to.equal('Unexpected token ( in JSON at position 0');

      done();
    });
  });
});
