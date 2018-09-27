import * as chai from 'chai';
import * as sinon from 'sinon';
import { DdfCsvError, getDDFCsvReaderObject } from '../src/index';
import { BASE_PATH, BROKEN_DATAPACKAGE_PATH, expectedConcepts, GLOBALIS_PATH, notExpectedError } from './common';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('General errors in ddfcsv reader', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('should be processed correctly', () => {
    it(`when dataset path is already in ddf csv reader base path`, async function() {
      const reader = getDDFCsvReaderObject();

      reader.init({});
      const query = {
        repositoryPath: './test/fixtures/VS-work/dataset_name_1/master-HEAD',
        select: {
          key: [ 'concept' ],
          value: [
            'concept_type', 'name'
          ]
        },
        from: 'concepts',
        where: {},
        order_by: [ 'concept' ]
      };
      let result;

      try {
        result = await reader.read(query);
      } catch (error) {
        throw new Error(`${notExpectedError} ${error}`);
      }

      expect(result).to.deep.equal(expectedConcepts);
    });

    it(`when 'File not found' happens`, async function() {
      const reader = getDDFCsvReaderObject();

      reader.init({});
      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
        dataset: GLOBALIS_PATH,
        select: {
          key: [ 'concept' ],
          value: [
            'concept_type', 'name'
          ]
        },
        from: 'concepts',
        where: {},
        order_by: [ 'concept' ]
      };
      sandbox.stub(reader.fileReader, 'readText').callsArgWithAsync(1, 'file is not found');

      try {
        await reader.read(query);
      } catch (error) {
        const expectedPath = './test/fixtures/systema_globalis/master-HEAD/datapackage.json';
        expect(error.details).to.equal('file is not found');
        expect(error.file).to.equal(expectedPath);
        expect(error.name).to.equal('DdfCsvError');
        expect(error).to.be.instanceOf(DdfCsvError);
        expect(error.message).to.equal(`File reading error [filepath: ${expectedPath}]. file is not found.`);
        return;
      }

      throw new Error(notExpectedError);
    });

    it(`when 'File not found' happens (stubless version)`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({});

      const query = {
        repositoryPath: './test/foo path/' + GLOBALIS_PATH + '/master-HEAD',
        select: {
          key: [ 'concept' ],
          value: [
            'concept_type', 'name'
          ]
        },
        from: 'concepts',
        where: {},
        order_by: [ 'concept' ]
      };

      try {
        await reader.read(query);
      } catch (error) {
        const expectedPath = './test/foo path/systema_globalis/master-HEAD/datapackage.json';

        expect(error.file).to.equal(expectedPath);
        expect(error.name).to.equal('DdfCsvError');
        expect(error.message).to.equal(`File reading error [filepath: ${expectedPath}]. No such file: ${expectedPath}.`);
      }
    });

    it(`when 'JSON parsing error' happens`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({});
      const query = {
        repositoryPath: BASE_PATH + BROKEN_DATAPACKAGE_PATH + '/master-HEAD',
        dataset: BROKEN_DATAPACKAGE_PATH,
        select: {
          key: [ 'concept' ],
          value: [
            'concept_type', 'name'
          ]
        },
        from: 'concepts',
        where: {},
        order_by: [ 'concept' ]
      };

      try {
        await reader.read(query);
      } catch (error) {
        const expectedPath = './test/fixtures/ds_broken_datapackage/master-HEAD/datapackage.json';

        expect(error.file).to.equal(expectedPath);
        expect(error.name).to.equal('DdfCsvError');
        expect(error.message).to.equal(`JSON parsing error [filepath: ${expectedPath}]. Unexpected token ( in JSON at position 0.`);
        expect(error.details).to.equal('Unexpected token ( in JSON at position 0');
      }
    });
  });
});
