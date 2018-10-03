import * as chai from 'chai';
import * as keys from 'lodash.keys';
import {
  BASE_PATH,
  checkExpectations,
  EXPECTS_EXACTLY_ONE_ERROR,
  getAmountOfErrors, GLOBALIS_PATH,
  notExpectedError,
  selectKeyClauseContainsUnavailableItems,
  selectKeyClauseMustHaveOnly1Item,
  selectValueClauseContainsUnavailableItems1,
  tooManyQueryDefinitionErrors, WS_TESTING_PATH
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
import { testsDescriptors, initData } from '../../src/test-cases/entities';

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

  describe('should never happen for happy flow', () => {
    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and 'ar-SA' language`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH + GLOBALIS_PATH + '/master-HEAD' });

      const result = await reader.read({
        language: 'ar-SA',
        select: {
          key: [ 'country' ],
          value: [ 'world_4region' ]
        },
        from: 'entities',
        where: {
          $and: [
            { country: { $in: [ 'usa', 'dza', 'abkh', 'afg' ] } }
          ]
        },
        order_by: [ 'country' ]
      });
      expect(result.length).to.equal(4);
    });

    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset without 'en' language in datapackage.json`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH + GLOBALIS_PATH + '/master-HEAD' });

      const result = await reader.read({
        from: 'entities',
        language: 'test',
        select: {
          key: [ 'country' ],
          value: [ 'world_4region', 'un_state' ]
        },
        order_by: [ 'country', { world_4region: -1 } ]
      });

      expect(result.length).to.equal(273);
    });

    it(`when requests only one column '${BASE_PATH + GLOBALIS_PATH}' dataset`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH + GLOBALIS_PATH + '/master-HEAD' });

      const result = await reader.read({
        language: 'ar-SA',
        select: {
          key: [ 'country' ]
        },
        from: 'entities',
        where: {
          $and: [
            { country: { $in: [ 'usa', 'dza', 'abkh', 'afg' ] } }
          ]
        }
      });

      expect(result.length).to.equal(4);
    });

    it('when requests entities with where clause', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH + GLOBALIS_PATH + '/master-HEAD' });

      const result = await reader.read({
        where: { world_6region: '$world_6region' },
        select: { key: [ 'country' ], value: [ 'world_6region', 'gapminder_list', 'god_id', 'landlocked' ] },
        from: 'entities',
        join: {
          $world_6region: {
            key: 'world_6region',
            where: {
              rank: { $eq: 2 }
            }
          }
        }
      });

      expect(result).to.be.deep.equal([
        {
          country: 'afg',
          gapminder_list: 'Afghanistan',
          god_id: 'AF',
          landlocked: 'landlocked',
          world_6region: 'south_asia'
        },
        {
          country: 'bgd',
          gapminder_list: 'Bangladesh',
          god_id: 'BD',
          landlocked: 'coastline',
          world_6region: 'south_asia'
        },
        {
          country: 'btn',
          gapminder_list: 'Bhutan',
          god_id: 'BT',
          landlocked: 'landlocked',
          world_6region: 'south_asia'
        },
        {
          country: 'ind',
          gapminder_list: 'India',
          god_id: 'IN',
          landlocked: 'coastline',
          world_6region: 'south_asia'
        },
        {
          country: 'lka',
          gapminder_list: 'Sri Lanka',
          god_id: 'LK',
          landlocked: 'coastline',
          world_6region: 'south_asia'
        },
        {
          country: 'mdv',
          gapminder_list: 'Maldives',
          god_id: 'MV',
          landlocked: 'coastline',
          world_6region: 'south_asia'
        },
        {
          country: 'npl',
          gapminder_list: 'Nepal',
          god_id: 'NP',
          landlocked: 'landlocked',
          world_6region: 'south_asia'
        },
        {
          country: 'pak',
          gapminder_list: 'Pakistan',
          god_id: 'PK',
          landlocked: 'coastline',
          world_6region: 'south_asia'
        }
      ]);
    });
  });

  describe('should be produced only for \'select\' section', () => {

    it('when \'key\' property has item that is absent in dataset', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH + WS_TESTING_PATH + '/master-HEAD' });

      reader.read({
        select: {
          key: [ 'failed_concept' ],
          value: [ 'company_scale', 'english_speaking' ]
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
      reader.init({ path: BASE_PATH + GLOBALIS_PATH + '/master-HEAD' });

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
      reader.init({ path: BASE_PATH + WS_TESTING_PATH + '/master-HEAD' });

      reader.read({
        from: 'entities',
        select: {
          key: [ 'company' ],
          value: [ 'failed_concept', 'english_speaking', 'company_scale', 'failed_concept2', 'lines_of_code' ]
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
