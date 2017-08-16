import * as chai from 'chai';
import * as _ from 'lodash';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;
const PATH_TO_DATA_SET = './test/fixtures/ddf--gapminder--static_assets';

describe(`when reader's getAsset method checking`, () => {
  it('should be expected result for JSON based asset', () => {
    const readerObject = getDDFCsvReaderObject();
    const EXPECTED_CONTENT = require('./fixtures/ddf--gapminder--static_assets/assets/world-50m.json');

    readerObject.init({path: PATH_TO_DATA_SET});

    const pro = readerObject.getAsset('/assets/world-50m.json');

    return pro.then(data => {
      expect(_.isEqual(data, EXPECTED_CONTENT)).to.be.true;
    });
  });

  it('should be expected result for TEXT based asset', () => {
    const readerObject = getDDFCsvReaderObject();
    const EXPECTED_CONTENT = 'test';

    readerObject.init({path: PATH_TO_DATA_SET});

    const pro = readerObject.getAsset('assets-text/test.txt');

    return pro.then(data => {
      expect(data).to.equal(EXPECTED_CONTENT);
    });
  });

  it('should be an error raised when asset path does NOT exist', () => {
    const readerObject = getDDFCsvReaderObject();

    readerObject.init({path: PATH_TO_DATA_SET});

    const pro = readerObject.getAsset('/assets-path-does-not-exist/test.txt');

    return pro.catch(error => {
      expect(!!error).to.be.true
    });
  });
});
