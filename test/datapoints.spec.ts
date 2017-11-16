import * as chai from 'chai';
import * as _ from 'lodash';
import { BackendFileReader, Ddf } from '../src/index';

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const GLOBALIS_TINY_PATH = './test/fixtures/systema_globalis_tiny';
const POP_WPP_PATH = './test/fixtures/population_wpp';
const SG_DP_MIX_ENTITY = './test/fixtures/sg_dp_mix_entity';

const expect = chai.expect;

describe('when data points checking', () => {
  let backendFileReader;

  beforeEach((done) => {
    backendFileReader = new BackendFileReader();

    done();
  });

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
      const EXPECTED_RECORDS_COUNT = 54467;
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
      const EXPECTED_RECORDS_COUNT = 1457;
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
        key: ['geo', 'time'],
        value: ['life_expectancy_years', 'income_per_person_gdppercapita_ppp_inflation_adjusted', 'population_total']
      },
      where: {$and: [{geo: '$geo'}, {time: '$time'}]},
      join: {
        $geo: {key: 'geo', where: {'is--country': true}},
        $time: {key: 'time', where: {time: '2015'}}
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
      const EXPECTED_RECORDS_COUNT = 87677;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('query by "ago" country should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_TINY_PATH, backendFileReader);
    const request = {
      language: 'en',
      from: 'datapoints',
      animatable: 'time',
      select: {
        key: ['geo', 'time'],
        value: ['sg_population', 'sg_gdp_p_cap_const_ppp2011_dollar', 'sg_gini']
      },
      where: {
        $and: [{geo: '$geo'}, {time: '$time'}]
      },
      join: {
        $geo: {key: 'geo', where: {'is--country': true, geo: {$in: ['ago']}}},
        $time: {key: 'time', where: {time: {$gte: '1800', $lte: '2015'}}}
      },
      order_by: ['time']
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 216;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('query by gender, age, and country with code 900 should be processed correctly', done => {
    const ddf = new Ddf(POP_WPP_PATH, backendFileReader);
    const request = {
      language: 'en',
      from: 'datapoints',
      animatable: 'year',
      select: {
        key: ['country_code', 'year', 'gender', 'age'],
        value: ['population']
      },
      where: {
        $and: [{country_code: '$country_code'}]
      },
      join: {
        $country_code: {key: 'country_code', where: {country_code: {$in: ['900']}}}
      },
      order_by: ['year']
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 28902;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('query by foo should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_TINY_PATH, backendFileReader);
    const request = {
      language: 'en',
      from: 'datapoints',
      animatable: 'time',
      select: {
        key: ['geo', 'time'],
        value: ['population_total']
      },
      where: {
        $and: [{geo: '$geo'}]
      },
      join: {
        $geo: {key: 'geo', where: {world_4region: {$in: ['americas', 'asia']}}}
      },
      order_by: ['time']
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 42849;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('should consume files with many indicators in different columns', done => {
    const ddf = new Ddf('./test/fixtures/ddf--bubbles-3', backendFileReader);
    const request = {
      language: 'en',
      from: 'datapoints',
      animatable: 'time',
      select: {
        key: ['country', 'time'],
        value: ['gdp_per_capita', 'life_expectancy', 'population']
      },
      where: {},
      join: {},
      orderBy: ['time']
    };
    const EXPECTED_FULL_RECORDS_COUNT = 41124;

    ddf.ddfRequest(request, (err, data) => {
      const fullData = data.filter(record => record['gdp_per_capita'] && record['life_expectancy'] && record['population']);

      expect(!!err).to.be.false;
      expect(fullData.length).to.equal(EXPECTED_FULL_RECORDS_COUNT);

      done();
    });
  });

  it('multidimentional dataset reading should return expected result', done => {
    const ddf = new Ddf('./test/fixtures/ddf--gapminder--population.big', backendFileReader);
    const request = {
      language: 'en',
      from: 'datapoints',
      animatable: 'year',
      select: {
        key: ['geo', 'year', 'age'],
        value: ['population']
      },
      where: {
        $and: [{geo: '$geo'}, {year: '$year'}, {age: '$age'}]
      },
      join: {
        $geo: {key: 'geo', where: {geo: {$in: ['world']}}},
        $year: {key: 'year', where: {year: '2017'}},
        $age: {key: 'age', where: {age: {$nin: ['80plus', '100plus']}}}
      },
      order_by: ['year']
    };
    const EXPECTED_RECORDS_COUNT = 100;

    ddf.ddfRequest(request, (err, data) => {

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });


  it('query with boolean condition should be processed correctly', done => {
    const ddf = new Ddf('./test/fixtures/presentation_set', backendFileReader);
    const request = {
      language: 'en',
      from: 'datapoints',
      animatable: 'time',
      select: {
        key: ['geo', 'time'],
        value: ['income_per_person_gdppercapita_ppp_inflation_adjusted', 'life_expectancy_years', 'population_total']
      },
      where: {
        $and: [{geo: '$geo'}, {time: '$time'}]
      },
      join: {
        $geo: {key: 'geo', where: {'un_state': true}},
        $time: {key: 'time', where: {time: {$gte: '1800', $lte: '2015'}}}
      },
      order_by: ['time']
    };

    const EXPECTED_RECORDS_COUNT = 42120;

    ddf.ddfRequest(request, (err, data) => {
      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('query with static assets should be processed correctly', done => {
    const ddf = new Ddf('./test/fixtures/static-assets', backendFileReader);
    const request = {
      language: 'en',
      from: 'datapoints',
      animatable: 'time',
      select: {
        key: ['geo', 'time'],
        value: ['income_mountains']
      },
      where: {
        $and: [{geo: '$geo'}, {time: '$time'}]
      },
      join: {
        $geo: {key: 'geo', where: {geo: {$in: ['world']}}},
        $time: {key: 'time', where: {time: '2015'}}
      },
      order_by: ['time']
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RESULT = {
        geo: 'world',
        time: '2015',
        income_mountains: '{"yMax": 2.57e+9, "shape": [0, 0, 0, 0, 6.52e+6, 3.54e+7, 8.27e+7, 1.45e+8, 2.16e+8, 2.91e+8, 3.65e+8, 4.36e+8, 5.06e+8, 5.83e+8, 6.77e+8, 7.99e+8, 9.62e+8, 1.17e+9, 1.41e+9, 1.67e+9, 1.93e+9, 2.17e+9, 2.37e+9, 2.51e+9, 2.57e+9, 2.56e+9, 2.49e+9, 2.38e+9, 2.23e+9, 2.07e+9, 1.90e+9, 1.73e+9, 1.57e+9, 1.41e+9, 1.25e+9, 1.08e+9, 9.01e+8, 7.26e+8, 5.62e+8, 4.17e+8, 2.96e+8, 2.03e+8, 1.34e+8, 8.66e+7, 5.45e+7, 3.36e+7, 2.02e+7, 1.19e+7, 6.86e+6, 3.84e+6, 2.10e+6, 2.10e+6]}'
      };

      expect(!!err).to.be.false;
      expect(_.isEqual(_.head(data), EXPECTED_RESULT)).to.be.true;

      done();
    });
  });

  it('query with join and world4region should be processed correctly', done => {
    const ddf = new Ddf('./test/fixtures/ddf--gapminder--population.big', backendFileReader);
    const request = {
      language: 'en',
      from: 'datapoints',
      animatable: 'year',
      select: {
        key: ['geo', 'year', 'age'],
        value: ['population']
      },
      where: {
        $and: [{geo: '$geo'}, {age: '$age'}]
      },
      join: {
        $geo: {key: 'geo', where: {geo: {$in: ['world']}}},
        $age: {key: 'age', where: {age: {$nin: ['80plus', '100plus']}}}
      },
      order_by: ['year']
    };

    const EXPECTED_RECORDS_COUNT = 14300;

    ddf.ddfRequest(request, (err, data) => {
      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('query on dataset that contains mixed kinds of entities in the same file should be processed correctly', done => {
    const ddf = new Ddf(SG_DP_MIX_ENTITY, backendFileReader);
    const request = {
      language: 'en',
      from: 'datapoints',
      animatable: 'year',
      select: {
        key: [
          'global',
          'time'
        ],
        value: [
          'population_total'
        ]
      },
      where: {},
      join: {},
      order_by: [
        'time'
      ]
    };
    const expectedData = {
      global: 'world',
      time: '2000',
      population_total: 777
    };

    ddf.ddfRequest(request, (err, data) => {
      expect(!!err).to.be.false;
      expect(data.length).to.equal(1);
      expect(_.isEqual(_.head(data), expectedData)).to.be.true;

      done();
    });
  });

  it('query on dataset when datapoint record contains domain but request contains entity set should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      select: {
        key: ['country', 'time'],
        value: ['population_total', 'life_expectancy_years']
      },
      from: 'datapoints',
      where: {
        $and: [
          {time: '$time'}
        ]
      },
      join: {
        $time: {
          key: 'time',
          where: {
            time: {
              $gte: '1993',
              $lte: '2015'
            }
          }
        }
      },
      order_by: ['time'],
      language: 'en',
    };

    const EXPECTED_RECORDS_COUNT = 5691;

    ddf.ddfRequest(request, (err, data) => {
      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });
});
