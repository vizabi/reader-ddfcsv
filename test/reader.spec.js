const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const _ = require('lodash');
const api = require('../dist/bundle');
const getDDFCsvReaderObject = api.getDDFCsvReaderObject;

/* eslint-disable camelcase */

const GLOBALIS_PATH = './test/fixtures/systema_globalis';

chai.use(sinonChai);

describe('when reader checking', () => {
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
      const EXPECTED_RECORDS_COUNT = 9;
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
      const EXPECTED_RECORDS_COUNT = 9;
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
});
