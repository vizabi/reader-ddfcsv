import * as chai from 'chai';
import * as sinon from 'sinon';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('schema queries in ddfcsv reader', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('DS that contains utf-8 bom should be processed correctly', () => {
    it(`for test_fasttrack`, async function() {
      const reader = getDDFCsvReaderObject();

      reader.init({});
      const query = {
        repositoryPath: './test/static-fixtures/ddf--gapminder--test_fasttrack',
        select: {
          key: ['key', 'value'],
          value: []
        },
        from: 'concepts.schema'
      };
      let result;

      try {
        result = await reader.read(query);

        expect(!!result).to.be.true;
      } catch (error) {
        throw error;
      }
    });
  });
});
