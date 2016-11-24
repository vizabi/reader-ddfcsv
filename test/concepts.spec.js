const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const _ = require('lodash');
const api = require('../dist/bundle');
const Ddf = api.Ddf;
const BackendFileReader = api.BackendFileReader;

/* eslint-disable camelcase */

const backendFileReader = new BackendFileReader();
const GLOBALIS_PATH = './test/fixtures/systema_globalis';

chai.use(sinonChai);

describe('when concepts checking', () => {
  it('concepts query should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
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

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 9;
      const EXPECTED_FIELDS_COUNT = 5;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      const firstRecord = _.head(data);
      const keys = Object.keys(firstRecord);

      expect(keys.length).to.equal(EXPECTED_FIELDS_COUNT);

      keys.forEach(key => {
        expect(_.includes(request.select.key, key) || _.includes(request.select.value, key)).to.be.true;
      });

      done();
    });
  });
});
