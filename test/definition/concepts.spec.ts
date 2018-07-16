import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  checkExpectations,
  EXPECTS_EXACTLY_ONE_ERROR,
  getAmountOfErrors,
  notExpectedError,
  selectKeyClauseContainsUnavailableItems,
  selectKeyClauseMustHaveOnly1Item,
  selectValueClauseContainsUnavailableItems1,
  tooManyQueryDefinitionErrors,
} from '../common';

const expect = chai.expect;

describe('Concepts definition errors in query', () => {
  describe('should be produced only for \'select\' section', () => {

    it('when \'key\' property has item that is absent in dataset', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      reader.read({
        select: {
          key: [ 'failed_concept' ],
          value: [ 'concept_type', 'name', 'description' ]
        },
        from: 'concepts'
      })
        .then(() => done(notExpectedError))
        .catch(error => {

          expect(error).to.match(tooManyQueryDefinitionErrors);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseContainsUnavailableItems);

          done();
        });
    });

    it('when \'key\' property has many items (structure error)', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({
        from: 'concepts', select: { key: [ 'concept', 'failed_concept' ] }
      })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseMustHaveOnly1Item);
        }, done));
    });

    it('when \'value\' property has items that is absent in dataset', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({
        from: 'concepts',
        select: {
          key: [ 'concept' ],
          value: [ 'domain', 'failed_concept', 'concept', 'name', 'population_total', 'failed_concept2' ]
        }
      })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error).to.match(tooManyQueryDefinitionErrors);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectValueClauseContainsUnavailableItems1);
        }, done));
    });

  });
});
