import * as chai from 'chai';
import * as sinon from 'sinon';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  checkExpectations,
  fromClauseCouldnotBeEmpty,
  languageClauseMustBeString,
  joinClauseMustBeObject,
  fromClauseMustBeString,
  whereClauseMustBeObject,
  orderByClauseMustHaveCertainStructure,
  whereClauseHasUnknownOperator,
  selectClauseCouldnotBeEmpty,
  selectClauseMustHaveStructure,
  fromClauseValueMustBeAllowed,
  notExpectedError,
  EXPECTS_EXACTLY_THREE_ERRORS,
  getAmountOfErrors,
  EXPECTS_EXACTLY_FOUR_ERRORS,
  EXPECTS_EXACTLY_TWO_ERRORS,
  EXPECTS_EXACTLY_ONE_ERROR,
  selectKeyClauseMustHaveAtLeast2Items,
  selectValueClauseMustHaveAtLeast1Item, whereClauseHasUnknownOperator1
} from '../common';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const BROKEN_DATAPACKAGE_PATH = './test/fixtures/ds_broken_datapackage';

describe('General structure errors in query', () => {
  afterEach(() => sandbox.restore());

  describe('should be produced only for \'from\' section', () => {
    it('when query is empty', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

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
      reader.init({ path: GLOBALIS_PATH });

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
      reader.init({ path: GLOBALIS_PATH });

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
      reader.init({ path: GLOBALIS_PATH });

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
      reader.init({ path: GLOBALIS_PATH });

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
      reader.init({ path: GLOBALIS_PATH });

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
      reader.init({ path: GLOBALIS_PATH });

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
    it('when it is not string', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ language: [], select: { key: [ 'concept' ] }, from: 'concepts' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(languageClauseMustBeString);
        }, done));
    });
  });

  describe('should be produced only for \'join\' section', () => {
    it('when it is not object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ join: [], select: { key: [ 'concept' ] }, from: 'concepts' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinClauseMustBeObject);
        }, done));
    });

    it('when it has not allowed operator in `join.$.where` clause', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        where: { '$concept': { $eq: 'country' } }, select: { key: [ 'concept' ] }, from: 'concepts'
      })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(whereClauseHasUnknownOperator);
        }, done));
    });
  });

  describe('should be produced only for \'where\' section', () => {
    it('when it is not object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

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
      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        where: { $concept: { $eq: 'country' } },
        select: { key: [ 'concept' ] },
        from: 'concepts',
        join: { $concept: {} }
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
          expect(error.toString()).to.match(whereClauseHasUnknownOperator1);
        }, done));
    });
  });

  describe('should be produced only for \'order_by\' section', () => {
    it('when it is not string or array of strings or array of objects', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

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
