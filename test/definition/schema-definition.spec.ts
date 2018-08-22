import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  EXPECTS_EXACTLY_ONE_ERROR,
  getAmountOfErrors,
  notExpectedError,
  selectKeyClauseContainsUnavailableItems,
  selectValueClauseContainsUnavailableItems2,
  tooManyQueryDefinitionErrors
} from '../common';
import { CONCEPTS, DATAPOINTS, ENTITIES } from 'ddf-query-validator';

const expect = chai.expect;

describe('Schemas definition errors in query', () => {

  describe('should be produced only for \'select\' section', () => {
    [ DATAPOINTS, ENTITIES, CONCEPTS ].forEach((queryType: string) => {
      it('when \'key\' property has item that is absent in dataset', done => {
        const reader = getDDFCsvReaderObject();

        reader.init({ path: BASE_PATH });

        reader.read({
          select: {
            key: [ 'failed_concept', 'value' ]
          },
          from: `${queryType}.schema`
        })
          .then(() => done(notExpectedError))
          .catch(error => {

            expect(error).to.match(tooManyQueryDefinitionErrors);
            expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
            expect(error.toString()).to.match(selectKeyClauseContainsUnavailableItems);

            done();
          });
      });

      it('when \'value\' property has item that is absent in dataset', done => {
        const reader = getDDFCsvReaderObject();

        reader.init({ path: BASE_PATH });

        reader.read({
          select: {
            key: [ 'key', 'value' ],
            value: [ 'failed_concept', 'key', 'failed_concept2', 'value', 'concept' ]
          },
          from: `${queryType}.schema`
        })
          .then(() => done(notExpectedError))
          .catch(error => {

            expect(error).to.match(tooManyQueryDefinitionErrors);
            expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
            expect(error.toString()).to.match(selectValueClauseContainsUnavailableItems2);

            done();
          });
      });
    });
  });
});
