import * as chai from 'chai';
import * as keys from 'lodash.keys';
import {
  BASE_PATH,
  checkExpectations,
  EXPECTS_EXACTLY_ONE_ERROR,
  getAmountOfErrors,
  notExpectedError,
  selectKeyClauseContainsUnavailableItems,
  selectKeyClauseMustHaveOnly1Item,
  selectValueClauseContainsUnavailableItems1,
  tooManyQueryDefinitionErrors
} from '../common';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  CONCEPT_TYPE_ENTITY_DOMAIN,
  CONCEPT_TYPE_ENTITY_SET,
  isEntityDomainOrSet,
  RESERVED_CONCEPT,
  RESERVED_CONCEPT_TYPE,
  RESERVED_DOMAIN,
  RESERVED_DRILL_UP
} from 'ddf-query-validator';
import { testsDescriptors, initData } from './test-cases/entities';

const expect = chai.expect;

describe('Entities definition errors in query', () => {
  const descriptions = keys(testsDescriptors);

  for (const description of descriptions) {
    describe(description, () => {
      for (const testsDescriptor of testsDescriptors[description]) {
        it(testsDescriptor.itTitle, async () => {
          const reader = getDDFCsvReaderObject();

          let data;

          try {
            await reader.init(initData);
            data = await reader.read(testsDescriptor.query);
          } catch (error) {
            throw error;
          }

          expect(data).to.not.null;
        });
      }
    });
  }

  describe('should be produced only for \'select\' section', () => {

    it('when \'key\' property has item that is absent in dataset', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      reader.read({
        select: {
          key: [ 'failed_concept' ],
          value: [ 'world_4region', 'un_state' ]
        },
        from: 'entities'
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
        from: 'entities', select: { key: [ 'geo', 'failed_concept' ] }
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
        from: 'entities',
        select: {
          key: [ 'geo' ],
          value: [ 'failed_concept', 'world_4region', 'un_state', 'failed_concept2', 'population_total' ]
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
