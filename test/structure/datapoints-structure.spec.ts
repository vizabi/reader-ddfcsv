import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  BIG_PATH,
  EXPECTS_EXACTLY_ONE_ERROR,
  EXPECTS_EXACTLY_TWO_ERRORS,
  getAmountOfErrors,
  GLOBALIS_PATH,
  notExpectedError,
  POP_WPP_PATH,
  selectClauseMustHaveStructure,
  selectKeyClauseMustHaveAtLeast2Items,
  selectValueClauseMustHaveAtLeast1Item,
  STATIC_ASSETS
} from '../common';
import { DEFAULT_DATASET_BRANCH, DEFAULT_DATASET_COMMIT } from 'ddf-query-validator/lib/helper.service';

const expect = chai.expect;
const expectedGlobalisMetadata = {
  commit: DEFAULT_DATASET_COMMIT,
  branch: DEFAULT_DATASET_BRANCH,
  dataset: GLOBALIS_PATH
};
const expectedBigMetadata = {
  commit: DEFAULT_DATASET_COMMIT,
  branch: DEFAULT_DATASET_BRANCH,
  dataset: BIG_PATH
};
const expectedPopWppMetadata = {
  commit: DEFAULT_DATASET_COMMIT,
  branch: DEFAULT_DATASET_BRANCH,
  dataset: POP_WPP_PATH
};
const expectedStaticMetadata = {
  commit: DEFAULT_DATASET_COMMIT,
  branch: DEFAULT_DATASET_BRANCH,
  dataset: STATIC_ASSETS
};

describe('Datapoints structure errors in query', () => {

  describe('should never happen for happy flow', () => {
    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and exists valid condition in 'join' section`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const result = await reader.read({
        select: {
          key: [ 'geo', 'time' ],
          value: [
            'life_expectancy_years', 'population_total'
          ]
        },
        from: 'datapoints',
        dataset: GLOBALIS_PATH,
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
      });

      const countryAntData = result.filter(record => record.geo === 'ant');

      expect(result.length).to.equal(1155);
      expect(countryAntData).to.be.an('array').that.is.empty;
    });

    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and ordering by complex fields`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const result = await reader.read({
        select: {
          key: [ 'geo', 'time' ],
          value: [
            'life_expectancy_years', 'population_total'
          ]
        },
        from: 'datapoints',
        order_by: [ 'time', { geo: 'asc' }, { life_expectancy_years: -1 } ]
      });

      expect(result.length).to.equal(52091);
    });

    it(`when requests '${BASE_PATH + BIG_PATH}' dataset`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({
        path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: BIG_PATH, branch: 'master', commit: 'HEAD' }
        }
      });
      const result = await reader.read({
        language: 'en',
        from: 'datapoints',
        dataset: BIG_PATH,
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
      });
      const expectedResult = require('../result-fixtures/in-clause-under-conjunction-1.json');

      expect(result).to.deep.equal(expectedResult);
    });

    it(`when requests '${BASE_PATH + POP_WPP_PATH}' dataset`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({
        path: BASE_PATH, datasetsConfig: {
          [ POP_WPP_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: POP_WPP_PATH, branch: 'master', commit: 'HEAD' }
        }
      });
      const result = await reader.read({
        language: 'en',
        from: 'datapoints',
        dataset: POP_WPP_PATH,
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
          'country_code',
          'year',
          'gender',
          'age'
        ]
      });
      const expectedResult = require('../result-fixtures/in-clause-under-conjunction-2.json');

      expect(result).to.deep.equal(expectedResult);
    });

    it(`when requests '${BASE_PATH + STATIC_ASSETS}' dataset`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({
        path: BASE_PATH, datasetsConfig: {
          [ STATIC_ASSETS ]: { master: [ 'HEAD' ] },
          default: { dataset: STATIC_ASSETS, branch: 'master', commit: 'HEAD' }
        }
      });
      const result = await reader.read({
        language: 'en',
        from: 'datapoints',
        dataset: STATIC_ASSETS,
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
      });
      const expectedResult = require('../result-fixtures/datapoints-assets.json');

      expect(result).to.deep.equal(expectedResult);
    });

    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and 'ar-SA' language`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const result = await reader.read({
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
        }
      );

      const countryAntData = result.filter(record => record.geo === 'ant');

      expect(result.length).to.equal(42705);
      expect(countryAntData).to.be.an('array').that.is.empty;
    });

    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and 'ru-RU' language`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const result = await reader.read({
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
        }
      );

      const countryAntData = result.filter(record => record.geo === 'ant');

      expect(result.length).to.equal(42705);
      expect(countryAntData).to.be.an('array').that.is.empty;
    });
  });

  describe('should be produced only for \'select.key\' section', () => {
    it('when it is not array', async () => {
      let actualErrors;
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      const query = { from: 'datapoints', select: { key: 'fail', value: [ 'population_total' ] } };

      try {
        await reader.read(query);
        throw new Error(notExpectedError);
      } catch (error) {
        actualErrors = error;
      } finally {
        expect(getAmountOfErrors(actualErrors)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualErrors.toString()).to.match(selectClauseMustHaveStructure);
      }
    });

    it('when it has 0 item', async () => {
      let actualErrors;
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      const query = { from: 'datapoints', select: { key: [], value: [ 'population_total' ] } };
      try {
        await reader.read(query);
        throw new Error(notExpectedError);
      } catch (error) {
        actualErrors = error;
      } finally {
        expect(getAmountOfErrors(actualErrors)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualErrors.toString()).to.match(selectKeyClauseMustHaveAtLeast2Items);
      }
    });

    it('when it has 1 item', async () => {
      let actualErrors;
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      const query = { from: 'datapoints', select: { key: [ 'geo' ], value: [ 'population_total' ] } };
      try {
        await reader.read(query);
        throw new Error(notExpectedError);
      } catch (error) {
        actualErrors = error;
      } finally {
        expect(getAmountOfErrors(actualErrors)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualErrors.toString()).to.match(selectKeyClauseMustHaveAtLeast2Items);
      }
    });
  });

  describe('should be produced only for \'select.value\' section', () => {
    it('when it is absent', async () => {
      let actualErrors;
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      const query = { from: 'datapoints', select: { key: [ 'geo', 'time' ] } };
      try {
        await reader.read(query);
        throw new Error(notExpectedError);
      } catch (error) {
        actualErrors = error;
      } finally {
        expect(getAmountOfErrors(actualErrors)).to.equals(EXPECTS_EXACTLY_TWO_ERRORS);
        expect(actualErrors.toString()).to.match(selectClauseMustHaveStructure);
        expect(actualErrors.toString()).to.match(selectValueClauseMustHaveAtLeast1Item);
      }
    });

    it('when it is not array', async () => {
      let actualErrors;
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      const query = { from: 'datapoints', select: { key: [ 'geo', 'time' ], value: 'fail' } };
      try {
        await reader.read(query);
        throw new Error(notExpectedError);
      } catch (error) {
        actualErrors = error;
      } finally {
        expect(getAmountOfErrors(actualErrors)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualErrors.toString()).to.match(selectClauseMustHaveStructure);
      }
    });

    it('when it is empty', async () => {
      let actualErrors;
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      const query = { from: 'datapoints', select: { key: [ 'geo', 'time' ], value: [] } };
      try {
        await reader.read(query);
        throw new Error(notExpectedError);
      } catch (error) {
        actualErrors = error;
      } finally {
        expect(getAmountOfErrors(actualErrors)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualErrors.toString()).to.match(selectValueClauseMustHaveAtLeast1Item);
      }
    });
  });
});
