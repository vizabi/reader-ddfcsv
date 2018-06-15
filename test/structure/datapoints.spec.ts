import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BIG_PATH,
  checkExpectations, EXPECTS_EXACTLY_ONE_ERROR, EXPECTS_EXACTLY_TWO_ERRORS, getAmountOfErrors,
  GLOBALIS_PATH,
  notExpectedError,
  POP_WPP_PATH,
  selectClauseCouldnotBeEmpty,
  selectClauseMustHaveStructure,
  selectKeyClauseMustHaveAtLeast2Items,
  selectValueClauseMustHaveAtLeast1Item,
  STATIC_ASSETS
} from '../common';

const expect = chai.expect;

describe('Datapoints structure errors in query', () => {
  describe('should never happen for happy flow', () => {
    it(`when requests '${GLOBALIS_PATH}' dataset and exists valid condition in 'join' section`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
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
      })
        .then(data => {
          const countryAntData = data.filter(record => record.geo === 'ant');

          expect(data.length).to.equal(1155);
          expect(countryAntData).to.be.an('array').that.is.empty;

          done();
        })
        .catch(done);
    });

    it(`when requests '${GLOBALIS_PATH}' dataset and ordering by complex fields`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: [ 'geo', 'time' ],
          value: [
            'life_expectancy_years', 'population_total'
          ]
        },
        from: 'datapoints',
        order_by: [ 'time', { geo: 'asc' }, { life_expectancy_years: -1 } ]
      })
        .then(data => {
          expect(data.length).to.equal(52091);

          done();
        })
        .catch(done);
    });

    it(`when requests '${BIG_PATH}' dataset`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BIG_PATH });
      reader.read({
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
      })
        .then(result => {
          const expectedResult = require('../result-fixtures/in-clause-under-conjunction-1.json');

          expect(result).to.deep.equal(expectedResult);

          done();
        })
        .catch(done);
    });

    it(`when requests '${POP_WPP_PATH}' dataset`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: POP_WPP_PATH });
      reader.read({
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
          'country_code',
          'year',
          'gender',
          'age'
        ]
      })
        .then(result => {
          const expectedResult = require('../result-fixtures/in-clause-under-conjunction-2.json');

          expect(result).to.deep.equal(expectedResult);

          done();
        })
        .catch(done);
    });

    it(`when requests '${STATIC_ASSETS}' dataset`, (done: Function) => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: STATIC_ASSETS });
      reader.read({
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
      })
        .then(result => {
          const expectedResult = require('../result-fixtures/datapoints-assets.json');

          expect(result).to.deep.equal(expectedResult);
          done();
        })
        .catch(done);
    });

    it(`when requests '${GLOBALIS_PATH}' dataset and 'ar-SA' language`, (done: Function) => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
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
      )
        .then(data => {
          const countryAntData = data.filter(record => record.geo === 'ant');

          expect(data.length).to.equal(42705);
          expect(countryAntData).to.be.an('array').that.is.empty;

          done();
        })
        .catch(done);
    });

    it(`when requests '${GLOBALIS_PATH}' dataset and 'ru-RU' language`, (done: Function) => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
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
      )
        .then(data => {
          const countryAntData = data.filter(record => record.geo === 'ant');

          expect(data.length).to.equal(42705);
          expect(countryAntData).to.be.an('array').that.is.empty;

          return done();
        })
        .catch(done);
    });
  });

  describe('should be produced only for \'select.key\' section', () => {
    it('when it is not array', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: 'fail', value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectClauseMustHaveStructure);
        }, done));
    });

    it('when it has 0 item', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseMustHaveAtLeast2Items);
        }, done));
    });

    it('when it has 1 item', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseMustHaveAtLeast2Items);
        }, done));
    });
  });

  describe('should be produced only for \'select.value\' section', () => {
    it('when it is absent', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo', 'time' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_TWO_ERRORS);
          expect(error.toString()).to.match(selectClauseMustHaveStructure);
          expect(error.toString()).to.match(selectValueClauseMustHaveAtLeast1Item);
        }, done));
    });

    it('when it is not array', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo', 'time' ], value: 'fail' } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectClauseMustHaveStructure);
        }, done));
    });

    it('when it is empty', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo', 'time' ], value: [] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectValueClauseMustHaveAtLeast1Item);
        }, done));
    });
  });
});
