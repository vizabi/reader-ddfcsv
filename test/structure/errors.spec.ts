import * as chai from 'chai';
import cloneDeep = require('lodash/cloneDeep');
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  checkExpectations,
  EXPECTS_EXACTLY_FOUR_ERRORS,
  EXPECTS_EXACTLY_ONE_ERROR,
  EXPECTS_EXACTLY_THREE_ERRORS,
  EXPECTS_EXACTLY_TWO_ERRORS,
  fromClauseCouldnotBeEmpty,
  fromClauseMustBeString,
  fromClauseValueMustBeAllowed,
  getAmountOfErrors,
  joinClauseMustBeObject, joinWhereClauseMustBeObject,
  languageClauseMustBeString,
  notExpectedError,
  orderByClauseMustHaveCertainStructure,
  selectClauseCouldnotBeEmpty,
  selectClauseMustHaveStructure,
  selectKeyClauseMustHaveAtLeast2Items,
  selectValueClauseMustHaveAtLeast1Item,
  whereClauseHasUnknownOperator,
  whereClauseMustBeObject,
  joinWhereClauseHasUnknownOperator,
  joinKeyClauseMustBeString,
} from '../common';
import { DATAPOINTS, ENTITIES, CONCEPTS } from '../../src/ddf-query-validator';

const expect = chai.expect;

describe('General structure errors in query', () => {

  describe('should be produced only for \'from\' section', () => {
    it('when query is empty', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({})
        .then(() => {
          return done(notExpectedError);
        })
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_FOUR_ERRORS);
          expect(error.toString()).to.match(fromClauseCouldnotBeEmpty);
          expect(error.toString()).to.match(fromClauseMustBeString);
          expect(error.toString()).to.match(fromClauseValueMustBeAllowed);
          expect(error.toString()).to.match(selectClauseCouldnotBeEmpty);
        }, done));
    });

    it('when section \'from\' is absent', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({ select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_THREE_ERRORS);
          expect(error.toString()).to.match(fromClauseCouldnotBeEmpty);
          expect(error.toString()).to.match(fromClauseMustBeString);
          expect(error.toString()).to.match(fromClauseValueMustBeAllowed);
        }, done));
    });

    it('when section \'from\' is object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({ from: {}, select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_TWO_ERRORS);
          expect(error.toString()).to.match(fromClauseMustBeString);
          expect(error.toString()).to.match(fromClauseValueMustBeAllowed);
        }, done));
    });

    it('when section \'from\' doesn\'t have available value', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({ from: 'fail', select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(fromClauseValueMustBeAllowed);
        }, done));
    });
  });

  describe('should be produced only for \'select\' section', () => {
    it('when it is absent', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({ from: 'datapoints' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_FOUR_ERRORS);
          expect(error.toString()).to.match(selectClauseCouldnotBeEmpty);
          expect(error.toString()).to.match(selectClauseMustHaveStructure);
          expect(error.toString()).to.match(selectKeyClauseMustHaveAtLeast2Items);
          expect(error.toString()).to.match(selectValueClauseMustHaveAtLeast1Item);
        }, done));
    });

    it('when it is empty', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({ from: 'datapoints', select: {} })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_THREE_ERRORS);
          expect(error.toString()).to.match(selectClauseMustHaveStructure);
          expect(error.toString()).to.match(selectKeyClauseMustHaveAtLeast2Items);
          expect(error.toString()).to.match(selectValueClauseMustHaveAtLeast1Item);
        }, done));
    });

    it('when it is not object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({ from: 'datapoints', select: 'fail' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_THREE_ERRORS);
          expect(error.toString()).to.match(selectClauseMustHaveStructure);
          expect(error.toString()).to.match(selectKeyClauseMustHaveAtLeast2Items);
          expect(error.toString()).to.match(selectValueClauseMustHaveAtLeast1Item);
        }, done));
    });
  });

  describe('should be produced only for \'language\' section', () => {
    it('when it is not string for \'concepts\'', function(done: Function): void {
      const FIXTURE_GENERIC_QUERY = { select: { key: [ 'concept' ] }, from: CONCEPTS };
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign({ language: [] }, cloneDeep(FIXTURE_GENERIC_QUERY)))
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(languageClauseMustBeString);
        }, done));
    });

    it('when it is not string for \'entities\'', function(done: Function): void {
      const FIXTURE_GENERIC_QUERY = { select: { key: [ 'country' ], value: [ 'world_6region', 'world_6region', 'landlocked' ] }, from: ENTITIES };
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign({ language: [] }, cloneDeep(FIXTURE_GENERIC_QUERY)))
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(languageClauseMustBeString);
        }, done));
    });

    it('when it is not string for \'datapoints\'', function(done: Function): void {
      const FIXTURE_GENERIC_QUERY = { select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] }, from: DATAPOINTS };
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign({ language: [] }, cloneDeep(FIXTURE_GENERIC_QUERY)))
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(languageClauseMustBeString);
        }, done));
    });
  });

  describe('should be produced only for \'join\' section and for \'entities\'', () => {
    const FIXTURE_GENERIC_QUERY = { select: { key: [ 'country' ], value: [ 'world_6region', 'world_6region', 'landlocked' ] }, from: ENTITIES };

    it('when it is not object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign({ join: [] }, cloneDeep(FIXTURE_GENERIC_QUERY)))
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinClauseMustBeObject);
        }, done));
    });

    it('when `join.$world_6region.where` clause is not object', function(done: Function): void {
      const FIXTURE_SUBQUERY = { where: { world_6region: '$test' }, join: { $test: { key: 'world_6region', where: '' } }};
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign(cloneDeep(FIXTURE_GENERIC_QUERY), FIXTURE_SUBQUERY))
        .then((result) => {
          // console.log(JSON.stringify(result, null, '\t'));
          return done(notExpectedError);
        })
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinWhereClauseMustBeObject);
        }, done));
    });

    it('when it has not allowed operator in `join.$world_6region.where` clause', function(done: Function): void {
      const FIXTURE_SUBQUERY = { where: { world_6region: '$test' }, join: { $geo: {key: 'country', where: {}}, $test: { key: 'world_6region', where: {$geo: 'country'} } }};
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign(cloneDeep(FIXTURE_GENERIC_QUERY), FIXTURE_SUBQUERY))
        .then((result) => {
          // console.log(JSON.stringify(result, null, '\t'));
          return done(notExpectedError);
        })
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinWhereClauseHasUnknownOperator);
        }, done));
    });

    it('when it has not allowed link to another join section in `join.$test.where` clause', function(done: Function): void {
      const FIXTURE_SUBQUERY = { where: { world_6region: '$test' }, join: { $geo: {key: 'country', where: {}}, $test: { key: 'world_6region', where: { country: '$geo' } } }};
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign(cloneDeep(FIXTURE_GENERIC_QUERY), FIXTURE_SUBQUERY))
        .then((result) => {
          // console.log(JSON.stringify(result, null, '\t'));
          return done(notExpectedError);
        })
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinWhereClauseHasUnknownOperator);
        }, done));
    });

    it('when `join.$test.key` clause is not string', function(done: Function): void {
      const FIXTURE_SUBQUERY = { where: { world_6region: '$test' }, join: { $test: { key: {}, where: {} } } };
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign(cloneDeep(FIXTURE_GENERIC_QUERY), FIXTURE_SUBQUERY))
        .then((result) => {
          // console.log(JSON.stringify(result, null, '\t'));
          return done(notExpectedError);
        })
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinKeyClauseMustBeString);
        }, done));
    });
  });

  describe('should be produced only for \'join\' section and for \'datapoints\'', () => {
    const FIXTURE_GENERIC_QUERY = { select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] }, from: DATAPOINTS };

    it('when it is not object', function(done: Function): void {
      const FIXTURE_SUBQUERY = { join: [] };
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign(FIXTURE_SUBQUERY, cloneDeep(FIXTURE_GENERIC_QUERY)))
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinClauseMustBeObject);
        }, done));
    });

    it('when `join.$world_6region.where` clause is not object', function(done: Function): void {
      const FIXTURE_SUBQUERY = { where: { geo: '$test' }, join: { $test: { key: 'country', where: '' } }};
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign(cloneDeep(FIXTURE_GENERIC_QUERY), FIXTURE_SUBQUERY))
        .then((result) => {
          // console.log(JSON.stringify(result, null, '\t'));
          return done(notExpectedError);
        })
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinWhereClauseMustBeObject);
        }, done));
    });

    it('when it has not allowed operator in `join.$world_6region.where` clause', function(done: Function): void {
      const FIXTURE_SUBQUERY = { where: { geo: '$test' }, join: { $geo: {key: 'country', where: {}}, $test: { key: 'country', where: {$geo: 'usa'} } }};
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign(cloneDeep(FIXTURE_GENERIC_QUERY), FIXTURE_SUBQUERY))
        .then((result) => {
          // console.log(JSON.stringify(result, null, '\t'));
          return done(notExpectedError);
        })
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinWhereClauseHasUnknownOperator);
        }, done));
    });

    it('when it has not allowed link to another join section in `join.$test.where` clause', function(done: Function): void {
      const FIXTURE_SUBQUERY = { where: { geo: '$test' }, join: { $geo: {key: 'country', where: {}}, $test: { key: 'country', where: { country: '$geo'} } }};
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign(cloneDeep(FIXTURE_GENERIC_QUERY), FIXTURE_SUBQUERY))
        .then((result) => {
          // console.log(JSON.stringify(result, null, '\t'));
          return done(notExpectedError);
        })
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinWhereClauseHasUnknownOperator);
        }, done));
    });

    it('when `join.$test.key` clause is not string', function(done: Function): void {
      const FIXTURE_SUBQUERY = { where: { country: '$test' }, join: { $test: { key: {}, where: {} } } };
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read(Object.assign(cloneDeep(FIXTURE_GENERIC_QUERY), FIXTURE_SUBQUERY))
        .then((result) => {
          // console.log(JSON.stringify(result, null, '\t'));
          return done(notExpectedError);
        })
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinKeyClauseMustBeString);
        }, done));
    });
  });

  describe('should be produced only for \'where\' section', () => {
    it('when it is not object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({ where: [], select: { key: [ 'concept' ] }, from: 'concepts' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(whereClauseMustBeObject);
        }, done));
    });

    it('when it has not allowed operator (even if it is present in \'join\' clause)', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({
        where: { $geo: { $eq: 'usa' } },
        select: { key: [ 'country' ] },
        from: 'entities',
        join: { $geo: {} }
      })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(whereClauseHasUnknownOperator);
        }, done));
    });

    it(`when it has not allowed operator (which is absent in 'join' clause)`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

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
            { time: '$time' },
            {
              $or: [
                { population_total: { $gt: 10000 }, geo: '$geo' },
                { life_expectancy_years: { $gt: 30, $lt: 70 } }
              ]
            }
          ]
        },
        join: {
          $time: {
            key: 'time',
            where: { $and: [ { time: { $gt: '1990', $lte: '2015' } } ] }
          }
        },
      })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(whereClauseHasUnknownOperator);
        }, done));
    });

    it(`when it has not allowed operator (and 'join' clause is absent)`, function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({
        select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] },
        from: 'datapoints',
        where: { $geo: { $eq: 'usa' } }
      })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(whereClauseHasUnknownOperator);
        }, done));
    });
  });

  describe('should be produced only for \'order_by\' section', () => {
    it('when it is not string or array of strings or array of objects', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({ order_by: {}, select: { key: [ 'concept' ] }, from: 'concepts' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(orderByClauseMustHaveCertainStructure);
        }, done));
    });
  });

});
