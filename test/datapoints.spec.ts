import * as chai from 'chai';
import {getDDFCsvReaderObject} from '../src/index';

const expect = chai.expect;

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const BIG_PATH = './test/fixtures/ddf--gapminder--population.big';
const POP_WPP_PATH = './test/fixtures/population_wpp';
const STATIC_ASSETS = './test/fixtures/static-assets';

describe('Datapoints supporting', () => {
  it('condition under join supporting', done => {
    const reader = getDDFCsvReaderObject();

    reader.init({path: GLOBALIS_PATH});

    reader.read({
      select: {
        key: ['geo', 'time'],
        value: [
          'life_expectancy_years', 'population_total'
        ]
      },
      from: 'datapoints',
      language: 'ar-SA',
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
      },
      order_by: ['time', 'geo']
    }).then(data => {
      const countryAntData = data.filter(record => record.geo === 'ant');

      expect(data.length).to.equal(1155);
      expect(countryAntData).to.be.an('array').that.is.empty;

      done();
    });
  });

  it('big 1', done => {
    const reader = getDDFCsvReaderObject();

    reader.init({path: BIG_PATH});
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

    reader.init({path: POP_WPP_PATH});
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

  it('assets', done => {
    const reader = getDDFCsvReaderObject();

    reader.init({path: STATIC_ASSETS});
    reader.read({
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
      order_by: ['geo', 'time']
    }).then(result => {
      const expectedResult = require('./result-fixtures/datapoints-assets.json');

      expect(result).to.deep.equal(expectedResult);

      done();
    });
  });
});
