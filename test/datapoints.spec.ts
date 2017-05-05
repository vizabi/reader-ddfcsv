import * as chai from 'chai';
import * as _ from 'lodash';
import { BackendFileReader, Ddf } from '../src/index';

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const GLOBALIS_TINY_PATH = './test/fixtures/systema_globalis_tiny';
const POP_WPP_PATH = './test/fixtures/population_wpp';

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
      const EXPECTED_RECORDS_COUNT = 54533;
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
      const EXPECTED_RECORDS_COUNT = 1448;
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
      const EXPECTED_RECORDS_COUNT = 233;

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
      const EXPECTED_RECORDS_COUNT = 87828;

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
      const EXPECTED_RECORDS_COUNT = 530;

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
        key: [
          'geo',
          'time'
        ],
        value: [
          'sg_population',
          'sg_gdp_p_cap_const_ppp2011_dollar',
          'sg_gini'
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
          where: {
            'is--country': true,
            geo: {
              $in: [
                'ago'
              ]
            }
          }
        },
        $time: {
          key: 'time',
          where: {
            time: {
              $gte: '1800',
              $lte: '2015'
            }
          }
        }
      },
      order_by: [
        'time'
      ]
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
        key: [
          'country_code',
          'year',
          'gender',
          'age'
        ],
        value: [
          'population'
        ]
      },
      where: {
        $and: [
          {
            country_code: '$country_code'
          }
        ]
      },
      join: {
        $country_code: {
          key: 'country_code',
          where: {
            country_code: {
              $in: [
                '900'
              ]
            }
          }
        }
      },
      order_by: [
        'year'
      ]
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
        key: [
          'geo',
          'time'
        ],
        value: [
          'population_total'
        ]
      },
      where: {
        $and: [
          {
            geo: '$geo'
          }
        ]
      },
      join: {
        $geo: {
          key: 'geo',
          where: {
            world_4region: {
              $in: [
                'americas',
                'asia'
              ]
            }
          }
        }
      },
      order_by: [
        'time'
      ]
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

      expect(fullData.length).to.equal(EXPECTED_FULL_RECORDS_COUNT);

      done();
    });
  });
});
