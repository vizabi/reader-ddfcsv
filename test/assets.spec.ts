import * as chai from 'chai';
import * as sinon from 'sinon';
import { getDDFCsvReaderObject } from '../src/index';
import { DdfCsvError } from '../src/ddfcsv-error';
import { notExpectedError } from './common';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('Assets functionality', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('when happy flow', () => {
    it(`for 'world-50m.json' assets with repositoryPath`, async () => {
      const expectedAssetsData = require('./assets-fixtures/world-50m.json');
      const reader = getDDFCsvReaderObject();

      reader.init({path: './test'});

      const result = await reader.getAsset('assets-fixtures/world-50m.json');

      expect(result).to.deep.equal(expectedAssetsData);
    });

    it(`for 'world-50m.json' assets with initial path`, async () => {
      const expectedAssetsData = require('./assets-fixtures/world-50m.json');
      const reader = getDDFCsvReaderObject();

      reader.init({});

      const result = await reader.getAsset('assets-fixtures/world-50m.json', './test');

      expect(result).to.deep.equal(expectedAssetsData);
    });

    it(`for 'world-50m.json' assets without initial path and repositoryPath`, async () => {
      const reader = getDDFCsvReaderObject();
      const filepath = 'assets-fixtures/world-50m.json';

      reader.init({});

      try {
        await reader.getAsset(filepath);
        throw new Error(notExpectedError);
      } catch (error) {
        expect(error).to.be.instanceOf(DdfCsvError);
        expect(error.name).to.equal('DdfCsvError');
        expect(error.message).to.equal(`Neither initial 'path' nor 'repositoryPath' as a second param were found. [filepath: ${filepath}]. Happens in 'getAsset' function.`);
        expect(error.details).to.equal('Happens in \'getAsset\' function');
        expect(error.file).to.equal(filepath);
      }
    });
  });
});
