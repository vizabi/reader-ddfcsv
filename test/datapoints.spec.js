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

describe('when data points checking', () => {
  it('plain query should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      from: 'datapoints',
      animatable: 'time',
      select: {
        key: ['geo', 'time'],
        value: ['life_expectancy_years', 'income_per_person_gdppercapita_ppp_inflation_adjusted', 'population_total']
      },
      where: {
        'geo.is--country': true,
        time: {$gt: 1800, $lt: 2016}
      },
      grouping: {},
      orderBy: 'time'
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 47930;
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

  it('joins query should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      select: {
        key: ['geo', 'time'],
        value: [
          'life_expectancy_years', 'population_total'
        ]
      },
      from: 'datapoints',
      where: {
        $and: [
          {geo: '$geo'},
          {time: '$time'},
          {
            $or: [
              {population_total: {$gt: 10000}},
              {life_expectancy_years: {$gt: 30, $lt: 70}}
            ]
          }
        ]
      },
      join: {
        $geo: {
          key: 'geo',
          where: {
            $and: [
              {'is--country': true},
              {latitude: {$lte: 0}}
            ]
          }
        },
        $time: {
          key: 'time',
          where: {$and: [{time: {$gt: '1990', $lte: '2015'}}]}
        }
      }
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 1349;
      const EXPECTED_FIELDS_COUNT = 4;

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

  it('joins query by one year should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      from: 'datapoints',
      animatable: 'time',
      select: {
        key: [
          'geo',
          'time'
        ],
        value: [
          'life_expectancy_years',
          'income_per_person_gdppercapita_ppp_inflation_adjusted',
          'population_total'
        ]
      },
      where: {
        $and: [
          {geo: '$geo'},
          {time: '$time'}
        ]
      },
      join: {
        $geo: {
          key: 'geo',
          where: {'is--country': true}
        },
        $time: {
          key: 'time',
          where: {time: '2015'}
        }
      },
      order_by: 'time'
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 232;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('joins query by all period should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      from: 'datapoints',
      animatable: 'time',
      select: {
        key: ['geo', 'time'],
        value: ['life_expectancy_years', 'income_per_person_gdppercapita_ppp_inflation_adjusted', 'population_total']
      },
      where: {$and: [{geo: '$geo'}]},
      join: {
        $geo: {
          key: 'geo',
          where: {'is--country': true}
        }
      },
      order_by: 'time'
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 68121;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('datapoints schema query should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      from: 'datapointsSchema',
      select: {
        key: ['geo', 'time'],
        value: []
      },
      where: {},
      grouping: {},
      orderBy: null
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 532;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });
});
