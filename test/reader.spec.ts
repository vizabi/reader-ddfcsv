import * as chai from 'chai';
import * as _ from 'lodash';
import { getDDFCsvReaderObject, getGithubDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;
const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const GITHUB_GLOBALIS_PATH = 'https://raw.githubusercontent.com/buchslava/ddf--gapminder--systema_globalis/master';

describe(`when reader's read method checking`, () => {
  it('result for concepts reading should be expected', () => {
    const readerObject = getDDFCsvReaderObject();
    const request = {
      select: {
        key: ['concept'],
        value: [
          'concept_type', 'name', 'unit', 'color'
        ]
      },
      from: 'concepts',
      where: {
        $and: [
          {concept_type: {$eq: 'entity_set'}}
        ]
      }
    };

    readerObject.init({path: GLOBALIS_PATH});

    const pro = readerObject.read(request);

    return pro.then(data => {
      const EXPECTED_RECORDS_COUNT = 8;
      const EXPECTED_FIELDS_COUNT = 5;

      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      const firstRecord = _.head(data);
      const keys = Object.keys(firstRecord);

      expect(keys.length).to.equal(EXPECTED_FIELDS_COUNT);

      keys.forEach(key => {
        expect(_.includes(request.select.key, key) || _.includes(request.select.value, key)).to.be.true;
      });
    });
  });

  it('result for concepts - entity sets reading should be expected', () => {
    const readerObject = getDDFCsvReaderObject();
    const request = {
      select: {
        key: ['concept'],
        value: [
          'concept_type', 'name'
        ]
      },
      from: 'concepts',
      where: {
        $and: [
          {concept_type: {$eq: 'entity_set'}}
        ]
      }
    };

    readerObject.init({path: GLOBALIS_PATH});

    const pro = readerObject.read(request);

    return pro.then(data => {
      const EXPECTED_RECORDS_COUNT = 8;
      const EXPECTED_FIELDS_COUNT = 3;

      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      const firstRecord = _.head(data);
      const keys = Object.keys(firstRecord);

      expect(keys.length).to.equal(EXPECTED_FIELDS_COUNT);

      keys.forEach(key => {
        expect(_.includes(request.select.key, key) || _.includes(request.select.value, key)).to.be.true;
      });
    });
  });

  it('result for concepts reading should be expected', () => {
    const readerObject = getGithubDDFCsvReaderObject();
    const request = {
      select: {
        key: ['concept'],
        value: [
          'concept_type', 'name', 'unit', 'color'
        ]
      },
      from: 'concepts',
      where: {
        $and: [
          {concept_type: {$eq: 'entity_set'}}
        ]
      }
    };

    readerObject.init({path: GITHUB_GLOBALIS_PATH});

    const pro = readerObject.read(request);

    return pro.then(data => {
      const EXPECTED_RECORDS_COUNT = 8;
      const EXPECTED_FIELDS_COUNT = 5;

      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      const firstRecord = _.head(data);
      const keys = Object.keys(firstRecord);

      expect(keys.length).to.equal(EXPECTED_FIELDS_COUNT);

      keys.forEach(key => {
        expect(_.includes(request.select.key, key) || _.includes(request.select.value, key)).to.be.true;
      });
    });
  });
});
