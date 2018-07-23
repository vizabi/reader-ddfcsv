import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  BIG_PATH,
  checkExpectations, EMPTY_TRANSLATIONS_PATH,
  EXPECTS_EXACTLY_ONE_ERROR,
  getAmountOfErrors,
  GLOBALIS_PATH,
  notExpectedError,
  selectKeyClauseContainsUnavailableItems,
  selectValueClauseContainsUnavailableItems,
  tooManyQueryDefinitionErrors,
  WS_TESTING_PATH
} from '../common';

const expect = chai.expect;

describe('Datapoints definition errors in query', () => {
  describe('should never happen for happy flow in lenient mode', () => {
    it('when testing the most complex query', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({
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
      })
        .then((data) => {
          expect(data).to.be.not.null;
          return done();
        })
        .catch(done);
    });

    it(`#0 when \'where\'[...]\'*.is--\' clause has absent concept in dataset ${BASE_PATH + GLOBALIS_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({
        from: 'datapoints',
        dataset: GLOBALIS_PATH,
        select: {
          key: [ 'geo', 'time' ], value: [ 'population_total' ]
        },
        where: {
          'geo.is--countr': true
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#1 when \'where\' clause has absent concept in dataset ${BASE_PATH + GLOBALIS_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({
        from: 'datapoints',
        dataset: GLOBALIS_PATH,
        select: {
          key: [ 'geo', 'time' ], value: [ 'population_total' ]
        },
        where: {
          'ge.is--country': true
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#2 when \'where\' clause has concept with valid relative in dataset ${BASE_PATH + BIG_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: BIG_PATH,
        select: {
          key: [ 'age', 'world_4region', 'year' ], value: [ 'population' ]
        },
        where: {
          'world_4region.country': true
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#3 when \'where\' clause has concept with invalid relative in dataset ${BASE_PATH + BIG_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: BIG_PATH,
        select: {
          key: [ 'age', 'landlocked', 'year' ], value: [ 'population' ]
        },
        where: {
          'age.landlocked': 'coastline'
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#4 when \'where\' clause has concept with relative from drill_down in dataset ${BASE_PATH + BIG_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: BIG_PATH,
        select: {
          key: [ 'age', 'country', 'year' ], value: [ 'population' ]
        },
        where: {
          'country.landlocked': 'coastline'
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#5 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: WS_TESTING_PATH,
        select: {
          key: [ 'company', 'anno' ], value: [ 'company_scale' ]
        },
        where: {
          lines_of_code: 31111
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#6 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: WS_TESTING_PATH,
        select: {
          key: [ 'company', 'anno' ], value: [ 'lines_of_code', 'company_scale' ]
        },
        where: {
          company: 'mcrsft'
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#7 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: WS_TESTING_PATH,
        select: {
          key: [ 'company_scale', 'anno' ], value: [ 'lines_of_code' ]
        },
        where: {
          company: 'mcrsft'
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#8 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: WS_TESTING_PATH,
        select: {
          key: [ 'company', 'anno' ], value: [ 'lines_of_code', 'company_scale' ]
        },
        where: {
          company_scale: 'small'
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#9 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: WS_TESTING_PATH,
        select: {
          key: [ 'company_scale', 'anno' ], value: [ 'lines_of_code' ]
        },
        where: {
          company_scale: 'small'
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#10 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: WS_TESTING_PATH,
        select: {
          key: [ 'company', 'anno' ], value: [ 'lines_of_code' ]
        },
        where: {
          company_scale: 'small'
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#11 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + BIG_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: BIG_PATH,
        select: {
          key: [ 'country', 'year' ], value: [ 'population' ]
        },
        where: {
          age: 10
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });

    it(`#12 when \'where\' clause has concepts not from \'select\' clause in dataset ${BASE_PATH + WS_TESTING_PATH}`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
        from: 'datapoints',
        dataset: WS_TESTING_PATH,
        select: {
          key: [ 'company', 'project' ], value: [ 'lines_of_code', 'company_scale', 'meeting_style' ]
        },
        where: {
          anno: 2016
        }
      })
        .then((data) => {
          expect(data).to.be.not.null;

          return done();
        })
        .catch(done);
    });
  });

  xdescribe('should never happen for happy flow in strict mode', () => {
    it('when testing complex query', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
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
      })
        .then((data) => {
          expect(data).to.be.not.null;

          done();
        })
        .catch(done);
    });

    it('test where clause 1', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ BIG_PATH ]: { master: [ 'HEAD' ] },
          [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        } });

      reader.read({
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
      })
        .then((data) => {
          expect(data).to.be.not.null;

        })
        .catch(done);
    });
  });

  describe('should be produced only for \'select\' section', () => {
    it('when \'key\' property has item that is absent in dataset', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({
        from: 'datapoints', select: { key: [ 'failed_concept', 'time' ], value: [ 'population_total' ] }
      })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error).to.match(tooManyQueryDefinitionErrors);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseContainsUnavailableItems);
        }, done));
    });

    it('when \'value\' property has item that is absent in dataset', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo', 'time' ], value: [ 'failed_measure' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error).to.match(tooManyQueryDefinitionErrors);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectValueClauseContainsUnavailableItems);
        }, done));
    });
  });
});
