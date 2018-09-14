import * as chai from 'chai';
import * as sinon from 'sinon';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('Assets functionality', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('when happy flow', () => {
    it(`for 'world-50m.json' assets`, async () => {
      const expectedAssetsData = require('./assets-fixtures/world-50m.json');
      const reader = getDDFCsvReaderObject();

      reader.init({
        path: './test/assets-fixtures'
      });

      const result = await reader.getAsset('world-50m.json');

      expect(result).to.deep.equal(expectedAssetsData);
    });
  });
});
