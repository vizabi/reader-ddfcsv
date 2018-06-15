import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BIG_PATH, checkExpectations,
  selectClauseCouldnotBeEmpty,
  selectClauseMustHaveStructure,
  selectKeyClauseMustHaveAtLeast2Items,
  selectKeyClauseContainsUnavailableItems,
  selectValueClauseMustHaveAtLeast1Item,
  selectValueClauseContainsUnavailableItems,
  GLOBALIS_PATH,
  notExpectedError,
  POP_WPP_PATH,
  STATIC_ASSETS, EXPECTS_EXACTLY_ONE_ERROR, getAmountOfErrors
} from '../common';

const expect = chai.expect;

describe('Datapoints definition errors in query', () => {
  describe('should be produced only for \'select\' section', () => {
    it('when \'key\' property has item that is absent in dataset', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'failed_concept', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseContainsUnavailableItems);
        }, done));
    });

    it('when \'value\' property has item that is absent in dataset', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo', 'time' ], value: [ 'failed_measure' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectValueClauseContainsUnavailableItems);
        }, done));
    });
  });
});
