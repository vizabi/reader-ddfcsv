import * as chai from 'chai';
import {
  BASE_PATH,
  checkExpectations,
  EMPTY_TRANSLATIONS_PATH,
  EXPECTS_EXACTLY_ONE_ERROR,
  getAmountOfErrors,
  notExpectedError,
  selectKeyClauseContainsUnavailableItems,
  selectKeyClauseMustHaveOnly1Item,
  selectValueClauseContainsUnavailableItems1,
  tooManyQueryDefinitionErrors,
  WS_TESTING_PATH
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

import * as map from 'lodash.map';
import * as flatMap from 'lodash.flatmap';
import * as isNil from 'lodash.isnil';
import * as keys from 'lodash.keys';

const expect = chai.expect;

const datasetsConfig = {
  [ WS_TESTING_PATH ]: { master: [ 'HEAD' ] },
  default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
};
const ALL_OPERATORS: string[] = [ null, '.', '.is--' ];
const ALL_CONCEPTS: string[] = [ '', ' ', RESERVED_CONCEPT, RESERVED_CONCEPT_TYPE, RESERVED_DOMAIN, RESERVED_DRILL_UP, 'company', 'english_speaking', 'company_scale', 'name', 'anno', 'lines_of_code', 'region', 'country', 'latitude', 'longitude', 'full_name_changed', 'project', 'domain', 'additional_column', 'meeting_style', 'popular_appeal', 'methodology' ];
const ALL_ENTITY_SETS_AND_DOMAINS: string[] = [ 'company', 'english_speaking', 'company_scale', 'region', 'project' ];

export const initData = { path: BASE_PATH, datasetsConfig };
export const testsDescriptors = {};

ALL_ENTITY_SETS_AND_DOMAINS.forEach((entitySetOrDomain: string) => {
  const BINARY_OPERATORS = [ ...flatMap(ALL_CONCEPTS, (parent: string) => map(ALL_CONCEPTS, (child) => [ parent, child ])) ];
  const UNARY_OPERATORS = [ ...ALL_CONCEPTS ];

  const description = `Autogenerated tests for ${entitySetOrDomain}`;

  if (!testsDescriptors[description]) {
    testsDescriptors[description] = [];
  }

  ALL_OPERATORS.forEach((operator: string) => {
    const CONCEPTS_CLAUSE: any[] = isNil(operator) ? UNARY_OPERATORS : map([ ...BINARY_OPERATORS ], (args: string[]) => args.join(operator));

    CONCEPTS_CLAUSE.forEach((clause: string) => {
      testsDescriptors[description].push({
        itTitle: `should be fine for ${clause}`,
        query: {
          from: 'entities',
          dataset: WS_TESTING_PATH,
          select: { key: [ entitySetOrDomain ] },
          where: {
            [ clause ]: true
          }
        }});
    });
  });
});

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
