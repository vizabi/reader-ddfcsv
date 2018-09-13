import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  checkExpectations,
  EXPECTS_EXACTLY_ONE_ERROR,
  EXPECTS_EXACTLY_TWO_ERRORS,
  getAmountOfErrors,
  GLOBALIS_PATH,
  notExpectedError,
  selectClauseMustHaveStructure,
  selectKeyClauseMustHaveOnly1Item,
  selectValueClauseMustHaveCertainStructure
} from '../common';
import { DEFAULT_DATASET_BRANCH, DEFAULT_DATASET_COMMIT } from 'ddf-query-validator/lib/helper.service';

const expect = chai.expect;
const expectedGlobalisMetadata = {
  commit: DEFAULT_DATASET_COMMIT,
  branch: DEFAULT_DATASET_BRANCH,
  dataset: GLOBALIS_PATH
};

describe('Entities structure errors in query', () => {
  describe('should never happen for happy flow', () => {
    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and 'ar-SA' language`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

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

      reader.init({ path: BASE_PATH });

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

      reader.init({ path: BASE_PATH });

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
      reader.init({ path: BASE_PATH });

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

  describe('should be produced only for \'select.key\' section', () => {
    it('when it is not array', async () => {
      let actualError;
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      try {
        await reader.read({
          select: {
            key: 'country',
            value: [ 'world_4region' ]
          },
          from: 'entities'
        });

        throw new Error(notExpectedError);
      } catch (error) {
        actualError = error;
      } finally {
        expect(getAmountOfErrors(actualError)).to.equals(EXPECTS_EXACTLY_TWO_ERRORS);
        expect(actualError.toString()).to.match(selectClauseMustHaveStructure);
        expect(actualError.toString()).to.match(selectKeyClauseMustHaveOnly1Item);
      }
    });

    it('when it has 0 item', async () => {
      let actualError;
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      try {
        await reader.read({
          select: {
            key: [],
            value: [ 'world_4region' ]
          },
          from: 'entities'
        });

        throw new Error(notExpectedError);
      } catch (error) {
        actualError = error;
      } finally {
        expect(getAmountOfErrors(actualError)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualError.toString()).to.match(selectKeyClauseMustHaveOnly1Item);
      }
    });

    it('when it has 2 items', async () => {
      let actualError;
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      try {
        await reader.read({
          select: {
            key: [ 'country', 'un_state' ],
            value: [ 'world_4region' ]
          },
          from: 'entities'
        });

        throw new Error(notExpectedError);
      } catch (error) {
        actualError = error;
      } finally {
        expect(getAmountOfErrors(actualError)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualError.toString()).to.match(selectKeyClauseMustHaveOnly1Item);
      }
    });
  });

  describe('should be produced only for \'select.value\' section', () => {
    it('when it is not array or empty', async () => {
      let actualError;
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      try {
        await reader.read({
          language: 'ar-SA',
          select: {
            key: [ 'country' ],
            value: 'world_4region'
          },
          from: 'entities',
          where: {
            $and: [
              { country: { $in: [ 'usa', 'dza', 'abkh', 'afg' ] } }
            ]
          }
        });

        throw new Error(notExpectedError);
      } catch (error) {
        actualError = error;
      } finally {
        expect(getAmountOfErrors(actualError)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualError.toString()).to.match(selectValueClauseMustHaveCertainStructure);
      }
    });
  });
});
