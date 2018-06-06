import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const BIG_PATH = './test/fixtures/ddf--gapminder--population.big';
const POP_WPP_PATH = './test/fixtures/population_wpp';
const STATIC_ASSETS = './test/fixtures/static-assets';

const expectedError1 = `'from' clause couldn't be empty`;
const expectedError2 = `'from' clause must be string only`;
const expectedError3 = `'from' clause must be one of the list: `;

const expectedError4 = `'select' clause couldn't be empty`;
const expectedError5 = `'select' clause must have next structure: { key: [...], value: [...] }`;
const expectedError6 = `'select.key' clause for 'datapoints' queries must have at least 2 items`;
const expectedError7 = `'select.key' clause for 'datapoints' queries contains unavailable item(s): failed_concept [repo: ${GLOBALIS_PATH}/]`;
const expectedError8 = `'select.value' clause for 'datapoints' queries must have at least 1 item`;
const expectedError9 = `'select.value' clause for 'datapoints' queries contains unavailable item(s): failed_measure [repo: ${GLOBALIS_PATH}/]`;

const notExpectedError = 'this should never be called';

describe('Datapoints supporting', () => {
  describe('# happy flow', () => {
    it('condition under join supporting', done => {
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
      }).then(data => {
        const countryAntData = data.filter(record => record.geo === 'ant');

        expect(data.length).to.equal(1155);
        expect(countryAntData).to.be.an('array').that.is.empty;

        done();
      });
    });

    it('big 1', done => {
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
      }).then(result => {
        const expectedResult = require('./result-fixtures/in-clause-under-conjunction-1.json');

        expect(result).to.deep.equal(expectedResult);

        done();
      });
    });

    it('big 2', done => {
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
      }).then(result => {
        const expectedResult = require('./result-fixtures/in-clause-under-conjunction-2.json');

        expect(result).to.deep.equal(expectedResult);

        done();
      });
    });

    it('assets', () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: STATIC_ASSETS });
      return reader.read({
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
      }).then(result => {
        const expectedResult = require('./result-fixtures/datapoints-assets.json');

        expect(result).to.deep.equal(expectedResult);

      });
    });

    it('condition under translations supporting: ar-SA', () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      return reader.read({
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
      ).then(data => {
        const countryAntData = data.filter(record => record.geo === 'ant');

        expect(data.length).to.equal(42705);
        expect(countryAntData).to.be.an('array').that.is.empty;

      });
    });

    it('condition under translations supporting: ru-RU', () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      return reader.read({
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
      ).then(data => {
        const countryAntData = data.filter(record => record.geo === 'ant');

        expect(data.length).to.equal(42705);
        expect(countryAntData).to.be.an('array').that.is.empty;

      });
    });
  });

  describe('# sad flow, when query is empty', () => {
    it('return many errors for each required section', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({}).then(() => {
        return done(notExpectedError);
      }).catch((error) => {
        // console.log(error.stack);
        expect(error.toString()).to.contain(expectedError1);
        expect(error.toString()).to.contain(expectedError2);
        expect(error.toString()).to.contain(expectedError3);
        expect(error.toString()).to.contain(expectedError4);
        expect(error.toString()).to.not.contain(expectedError5);
        return done();
      });
    });
  });

  describe('# sad flow, return only involved errors from this section, when query \'select\' section', () => {
    it('is absent', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints' })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError5);
          return done();
        });
    });

    it('is empty', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: {} })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError5);
          return done();
        });
    });

    it('is not object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: 'fail' })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError5);
          return done();
        });
    });

    it('\'key\' property is not array', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: 'fail', value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError5);
          return done();
        });
    });

    it('\'key\' property has 0 item', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          expect(error.toString()).to.contain(expectedError6);
          return done();
        });
    });

    it('\'key\' property has 1 item', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          expect(error.toString()).to.contain(expectedError6);
          return done();
        });
    });

    it('\'key\' property has item that is absent in dataset', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'failed_concept', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          expect(error.toString()).to.not.contain(expectedError6);
          expect(error.toString()).to.contain(expectedError7);
          return done();
        });
    });

    it('\'value\' property is absent', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo', 'time' ] } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError5);
          expect(error.toString()).to.contain(expectedError8);
          return done();
        });
    });

    it('\'value\' property is not array', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo', 'time' ], value: 'fail' } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError5);
          expect(error.toString()).to.not.contain(expectedError8);
          return done();
        });
    });

    it('\'value\' property is empty', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo', 'time' ], value: [] } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          expect(error.toString()).to.contain(expectedError8);
          return done();
        });
    });

    it('\'value\' property has item that is absent in dataset', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo', 'time' ], value: [ 'failed_measure' ] } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError9);
          return done();
        });
    });
  });

  describe('# sad flow, return only involved errors from this section, when query \'from\' section', () => {
    it('is absent', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.contain(expectedError1);
          expect(error.toString()).to.contain(expectedError2);
          expect(error.toString()).to.contain(expectedError3);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          return done();
        });
    });

    it('is object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: {}, select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError1);
          expect(error.toString()).to.contain(expectedError2);
          expect(error.toString()).to.contain(expectedError3);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          return done();
        });
    });

    it('doesn\'t have available value', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'fail', select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError1);
          expect(error.toString()).to.not.contain(expectedError2);
          expect(error.toString()).to.contain(expectedError3);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          return done();
        });
    });
  });
});
