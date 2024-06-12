import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import * as _ from 'lodash';
import {
  BASE_PATH,
  BIG_PATH,
  EMPTY_TRANSLATIONS_PATH,
  expectPromiseRejection,
  GLOBALIS_PATH,
  POP_WPP_PATH,
  selectKeyClauseContainsUnavailableItems,
  selectValueClauseContainsUnavailableItems,
  STATIC_ASSETS,
  WS_TESTING_PATH
} from '../common';

const expect = chai.expect;
const INIT_READER_PATH = BASE_PATH + GLOBALIS_PATH + '/master-HEAD';

function parseYear(expectedResult, concept = 'year') {
  for (const row of expectedResult) {
    row[concept] = new Date(Date.UTC(row[concept], 0));
  }
}

describe('Datapoints definition errors in query', () => {
  describe('should never happen for happy flow', () => {
    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and exists valid condition in 'join' section`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: INIT_READER_PATH,
        select: {
          key: [ 'geo', 'time' ],
          value: [
            'life_expectancy_years', 'population_total'
          ]
        },
        from: 'datapoints',
        where: {
          $and: [
            { geo: '$geo' },
            { time: '$time' },
            {
              $or: [
                { population_total: { $gt: 10000 } },
                { life_expectancy_years: { $gt: 30, $lt: 70 } }
              ]
            }
          ]
        },
        join: {
          $geo: {
            key: 'geo',
            where: {
              $and: [
                { 'is--country': true },
                { latitude: { $lte: 0 } }
              ]
            }
          },
          $time: {
            key: 'time',
            where: { $and: [ { time: { $gt: '1990', $lte: '2015' } } ] }
          }
        },
        order_by: [ 'time', 'geo' ]
      };
      const result = await reader.read(query);

      const countryAntData = result.filter(record => record.geo === 'ant');

      expect(result.length).to.equal(977);
      expect(countryAntData).to.be.an('array').that.is.empty;
    });

    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and ordering by complex fields`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: INIT_READER_PATH,
        select: {
          key: [ 'geo', 'time' ],
          value: [
            'life_expectancy_years', 'population_total'
          ]
        },
        from: 'datapoints',
        order_by: [ 'time', { geo: 'asc' }, { life_expectancy_years: -1 } ]
      };

      const result = await reader.read(query);

      expect(result.length).to.equal(60180);
    });

    it(`when requests '${BASE_PATH + BIG_PATH}' dataset`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + BIG_PATH + '/master-HEAD',
        language: 'en',
        from: 'datapoints',
        animatable: 'year',
        select: {
          key: [
            'geo',
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
              geo: '$geo'
            },
            {
              year: '$year'
            },
            {
              gender: '$gender'
            },
            {
              age: '$age'
            }
          ]
        },
        join: {
          $geo: {
            key: 'geo',
            where: {
              $and: [
                {
                  $or: [
                    {
                      un_state: true
                    },
                    {
                      'is--global': true
                    },
                    {
                      'is--world_4region': true
                    }
                  ]
                },
                {
                  geo: {
                    $in: [
                      'world'
                    ]
                  }
                }
              ]
            }
          },
          $year: {
            key: 'year',
            where: {
              year: '2018'
            }
          },
          $gender: {
            key: 'gender',
            where: {
              gender: {
                $in: [
                  'female'
                ]
              }
            }
          },
          $age: {
            key: 'age',
            where: {
              age: {
                $nin: [
                  '80plus',
                  '100plus'
                ]
              }
            }
          }
        },
        order_by: [
          'year'
        ]
      };
      const result = await reader.read(query);
      const expectedResult = require('../result-fixtures/in-clause-under-conjunction-1.json');
      parseYear(expectedResult);

      expect(result).to.deep.equal(expectedResult);
    });

    it(`when requests '${BASE_PATH + POP_WPP_PATH}' dataset`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + POP_WPP_PATH + '/master-HEAD',
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
                  900
                ]
              }
            }
          }
        },
        order_by: [
          'country_code',
          'year',
          'gender',
          'age'
        ]
      };
      const result = await reader.read(query);
      const expectedResult = require('../result-fixtures/in-clause-under-conjunction-2.json');
      parseYear(expectedResult);

      expect(result).to.deep.equal(expectedResult);
    });

    it(`when requests '${BASE_PATH + STATIC_ASSETS}' dataset`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + STATIC_ASSETS + '/master-HEAD',
        language: 'en',
        from: 'datapoints',
        animatable: 'time',
        select: {
          key: [ 'geo', 'time' ],
          value: [ 'income_mountains' ]
        },
        where: {
          $and: [ { geo: '$geo' }, { time: '$time' } ]
        },
        join: {
          $geo: { key: 'geo', where: { geo: { $in: [ 'world' ] } } },
          $time: { key: 'time', where: { time: '2015' } }
        },
        order_by: [ 'geo', 'time' ]
      };
      const result = await reader.read(query);
      const expectedResult = require('../result-fixtures/datapoints-assets.json');
      parseYear(expectedResult, 'time');

      expect(result).to.deep.equal(expectedResult);
    });

    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and 'ar-SA' language`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: INIT_READER_PATH,
        language: 'ar-SA',
        from: 'datapoints',
        animatable: 'time',
        select: {
          key: [
            'geo',
            'time'
          ],
          value: [
            'income_per_person_gdppercapita_ppp_inflation_adjusted',
            'life_expectancy_years',
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
              un_state: true
            }
          }
        },
        order_by: [
          'time'
        ]
      };
      const result = await reader.read(query);

      const countryAntData = result.filter(record => record.geo === 'ant');

      expect(result.length).to.equal(58695);
      expect(countryAntData).to.be.an('array').that.is.empty;
    });

    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and 'ru-RU' language`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: INIT_READER_PATH,
        language: 'ru-RU',
        from: 'datapoints',
        animatable: 'time',
        select: {
          key: [
            'geo',
            'time'
          ],
          value: [
            'income_per_person_gdppercapita_ppp_inflation_adjusted',
            'life_expectancy_years',
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
              un_state: true
            }
          }
        },
        order_by: [
          'time'
        ]
      };
      const result = await reader.read(query);

      const countryAntData = result.filter(record => record.geo === 'ant');

      expect(result.length).to.equal(58695);
      expect(countryAntData).to.be.an('array').that.is.empty;
    });
  });

  describe('should never happen for happy flow in lenient mode', () => {
    it('when testing the most complex query', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: INIT_READER_PATH,
        from: 'datapoints',
        select: {
          key: [ 'geo', 'time' ], value: [ 'population_total', 'life_expectancy_years', 'gdp_per_capita_yearly_growth' ]
        },
        where: {
          geo: '$geo',
          time: { $eq: 2015 },
          $or: [
            { population: { $gt: 100000 } },
            { life_expectancy: { $gt: 30, $lt: 70 } },
            {
              $or: [
                { $and: [ { geo: '$geo' } ] },
                { gdp_per_cap: { $gt: 600, $lt: 500 } },
                { gdp_per_cap: { $gt: 1000 } }
              ]
            }
          ]
        },
        order_by: [ 'life_expectancy', 'population' ],
        join: {
          $geo: {
            key: 'geo',
            where: {
              'is--country': true,
              'latitude': { $lte: 0 },
            }
          }
        },
        language: 'en'
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#0 when \'where\'[...]\'*.is--\' clause has absent concept in dataset ${BASE_PATH + GLOBALIS_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: INIT_READER_PATH,
        from: 'datapoints',
        select: {
          key: [ 'geo', 'time' ], value: [ 'population_total' ]
        },
        where: {
          'geo.is--countr': true
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#1 when \'where\' clause has absent concept in dataset ${BASE_PATH + GLOBALIS_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: INIT_READER_PATH,
        from: 'datapoints',
        select: {
          key: [ 'geo', 'time' ], value: [ 'population_total' ]
        },
        where: {
          'ge.is--country': true
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#2 when \'where\' clause has concept with valid relative in dataset ${BASE_PATH + BIG_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + BIG_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'age', 'world_4region', 'year' ], value: [ 'population' ]
        },
        where: {
          'world_4region.country': true
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#3 when \'where\' clause has concept with invalid relative in dataset ${BASE_PATH + BIG_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + BIG_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'age', 'landlocked', 'year' ], value: [ 'population' ]
        },
        where: {
          'age.landlocked': 'coastline'
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#4 when \'where\' clause has concept with relative from drill_down in dataset ${BASE_PATH + BIG_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + BIG_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'age', 'country', 'year' ], value: [ 'population' ]
        },
        where: {
          'country.landlocked': 'coastline'
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#5 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'company', 'anno' ], value: [ 'company_scale' ]
        },
        where: {
          lines_of_code: 31111
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#6 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'company', 'anno' ], value: [ 'lines_of_code', 'company_scale' ]
        },
        where: {
          company: 'mcrsft'
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#7 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'company_scale', 'anno' ], value: [ 'lines_of_code' ]
        },
        where: {
          company: 'mcrsft'
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#8 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'company', 'anno' ], value: [ 'lines_of_code', 'company_scale' ]
        },
        where: {
          company_scale: 'small'
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#9 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'company_scale', 'anno' ], value: [ 'lines_of_code' ]
        },
        where: {
          company_scale: 'small'
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#10 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'company', 'anno' ], value: [ 'lines_of_code' ]
        },
        where: {
          company_scale: 'small'
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#11 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + BIG_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + BIG_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'country', 'year' ], value: [ 'population' ]
        },
        where: {
          age: 10
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it(`#12 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'company', 'project' ], value: [ 'lines_of_code', 'company_scale', 'meeting_style' ]
        },
        where: {
          anno: 2016
        }
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });
  });

  xdescribe('should never happen for happy flow in strict mode', () => {
    it('when testing complex query', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + EMPTY_TRANSLATIONS_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'geo', 'time' ], value: [ 'population_total', 'life_expectancy_years', 'gdp_per_capita_yearly_growth' ]
        },
        where: {
          geo: '$geo',
          time: { $eq: 2015 },
          $or: [
            { population: { $gt: 100000 } },
            { life_expectancy: { $gt: 30, $lt: 70 } },
            {
              $or: [
                { $and: [ { geo: '$geo' } ] },
                { gdp_per_cap: { $gt: 600, $lt: 500 } },
                { gdp_per_cap: { $gt: 1000 } }
              ]
            }
          ]
        },
        order_by: [ 'life_expectancy', 'population' ],
        join: {
          $geo: {
            key: 'geo',
            where: {
              'is--country': true,
              'latitude': { $lte: 0 },
            }
          }
        },
        language: 'en'
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });

    it('when testing complex query 2', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + EMPTY_TRANSLATIONS_PATH + '/master-HEAD',
        from: 'datapoints',
        select: {
          key: [ 'geo', 'time' ], value: [ 'population_total', 'life_expectancy_years', 'gdp_per_capita_yearly_growth' ]
        },
        where: {
          geo: '$geo',
          time: { $eq: 2015 },
          $or: [
            { population: { $gt: 100000 } },
            { life_expectancy: { $gt: 30, $lt: 70 } },
            {
              $or: [
                { $and: [ { 'geo.is--country': true, 'geo.world_4region': 'africa' } ] },
                { gdp_per_cap: { $gt: 600, $lt: 500 } },
                { gdp_per_cap: { $gt: 1000 } }
              ]
            }
          ]
        },
        order_by: [ 'life_expectancy', 'population' ],
        join: {
          $geo: {
            key: 'geo',
            where: {
              'is--country': true,
              'latitude': { $lte: 0 },
            }
          }
        },
        language: 'en'
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });
  });

  describe('should be produced only for \'select\' section', () => {
    it('when \'key\' property has item that is absent in dataset', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'datapoints',
        select: { key: [ 'failed_concept', 'anno' ], value: [ 'lines_of_code' ] }
      };

      await expectPromiseRejection({
        promiseFunction: reader.read.bind(reader),
        args: [ query ],
        expectedErrors: [ selectKeyClauseContainsUnavailableItems ],
        type: 'definitions'
      });
    });

    it('when debug mode and \'value\' property has item that is absent in dataset', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        debug: true,
        from: 'datapoints',
        select: { key: [ 'company', 'anno' ], value: [ 'failed_measure' ] }
      };

      await expectPromiseRejection({
        promiseFunction: reader.read.bind(reader),
        args: [ query ],
        expectedErrors: [ selectValueClauseContainsUnavailableItems ],
        type: 'definitions'
      });
    });

    it('when \'value\' property has item that is absent in dataset', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'datapoints',
        select: { key: [ 'company', 'anno' ], value: [ 'failed_measure' ] }
      };

      const result = await reader.read(query);
      expect(result).to.be.deep.equal([]);
    });
  });

  describe('any plugin should not be selected', () => {
    it('when request is not based on same key under where', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: INIT_READER_PATH,
        from: 'datapoints',
        language: 'ru-RU',
        select: {
          key: [
            'geo',
            'time'
          ],
          value: [
            'income_per_person_gdppercapita_ppp_inflation_adjusted',
            'life_expectancy_years',
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
              $and: [
                {
                  un_state: true
                },
                {
                  world_4region: {
                    $in: [
                      'asia'
                    ]
                  }
                }
              ]
            }
          }
        },
        order_by: [
          'time'
        ]
      };
      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });
  });

  describe('an appropriate plugin should be selected', () => {
    it('when request is based on same entity set key under where', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: INIT_READER_PATH,
        from: 'datapoints',
        select: {
          key: [
            'country',
            'time'
          ],
          value: [
            'income_per_person_gdppercapita_ppp_inflation_adjusted',
            'life_expectancy_years',
            'population_total'
          ]
        },
        where: {
          $and: [
            {
              country: '$country'
            }
          ]
        },
        join: {
          $country: {
            key: 'country',
            where: {
              country: { $in: [ 'afg' ] }
            }
          }
        },
        order_by: [
          'time'
        ]
      };

      const data = await reader.read(query);
      expect(data).to.be.not.null;
    });
  });
});
