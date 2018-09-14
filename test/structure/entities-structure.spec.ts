import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  expectPromiseRejection,
  GLOBALIS_PATH,
  selectClauseMustHaveStructure,
  selectKeyClauseMustHaveOnly1Item,
  selectValueClauseMustHaveCertainStructure
} from '../common';

const expect = chai.expect;

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

      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: 'country',
          value: [ 'world_4region' ]
        },
        from: 'entities'
      };

      await expectPromiseRejection({
        promiseFunction: reader.read.bind(reader),
        args: [ query ],
        expectedErrors: [ selectClauseMustHaveStructure, selectKeyClauseMustHaveOnly1Item ]
      });
    });

    it('when it has 0 item', async () => {

      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: [],
          value: [ 'world_4region' ]
        },
        from: 'entities'
      };

      await expectPromiseRejection({
        promiseFunction: reader.read.bind(reader),
        args: [ query ],
        expectedErrors: [ selectKeyClauseMustHaveOnly1Item ]
      });
    });

    it('when it has 2 items', async () => {

      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: [ 'country', 'un_state' ],
          value: [ 'world_4region' ]
        },
        from: 'entities'
      };

      await expectPromiseRejection({
        promiseFunction: reader.read.bind(reader),
        args: [ query ],
        expectedErrors: [ selectKeyClauseMustHaveOnly1Item ]
      });
    });
  });

  describe('should be produced only for \'select.value\' section', () => {
    it('when it is not array or empty', async () => {

      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
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
      };

      await expectPromiseRejection({
        promiseFunction: reader.read.bind(reader),
        args: [ query ],
        expectedErrors: [ selectValueClauseMustHaveCertainStructure ]
      });
    });
  });
});
