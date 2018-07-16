import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  checkExpectations,
  EXPECTS_EXACTLY_ONE_ERROR,
  getAmountOfErrors,
  notExpectedError,
  selectKeyClauseContainsUnavailableItems,
  selectValueClauseContainsUnavailableItems,
  tooManyQueryDefinitionErrors
} from '../common';

const expect = chai.expect;

describe('Datapoints definition errors in query', () => {
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
