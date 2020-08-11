import 'mocha';
import * as chai from 'chai';
import * as keys from 'lodash.keys';
import {
  BASE_PATH,
  expectPromiseRejection,
  GLOBALIS_PATH,
  selectKeyClauseContainsUnavailableItems,
  selectKeyClauseMustHaveOnly1Item,
  selectValueClauseContainsUnavailableItems1,
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
import { testsDescriptors, initData } from '../../src/test-cases/entities';

const expect = chai.expect;

describe('Entities definition errors in query', () => {
  const descriptions = keys(testsDescriptors);

  for (const description of descriptions) {
    describe(description, () => {
      for (const testsDescriptor of testsDescriptors[ description ]) {
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

      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
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
      };
      const result = await reader.read(query);
      expect(result.length).to.equal(4);
    });

    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset without 'en' language in datapackage.json`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
        from: 'entities',
        language: 'test',
        select: {
          key: [ 'country' ],
          value: [ 'world_4region', 'un_state' ]
        },
        order_by: [ 'country', { world_4region: -1 } ]
      };
      const result = await reader.read(query);

      expect(result.length).to.equal(273);
    });

    it(`when requests only one column '${BASE_PATH + GLOBALIS_PATH}' dataset`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
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
      };
      const result = await reader.read(query);

      expect(result.length).to.equal(4);
    });

    it('when requests entities with where clause', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
        where: { world_6region: '$world_6region' },
        select: { key: [ 'country' ], value: [ 'world_6region', 'landlocked' ] },
        from: 'entities',
        join: {
          $world_6region: {
            key: 'world_6region',
            where: {
              rank: { $eq: 2 }
            }
          }
        }
      };
      const result = await reader.read(query);

      expect(result).to.be.deep.equal([
        {
          country: 'afg',
          landlocked: 'landlocked',
          world_6region: 'south_asia'
        },
        {
          country: 'bgd',
          landlocked: 'coastline',
          world_6region: 'south_asia'
        },
        {
          country: 'btn',
          landlocked: 'landlocked',
          world_6region: 'south_asia'
        },
        {
          country: 'ind',
          landlocked: 'coastline',
          world_6region: 'south_asia'
        },
        {
          country: 'lka',
          landlocked: 'coastline',
          world_6region: 'south_asia'
        },
        {
          country: 'mdv',
          landlocked: 'coastline',
          world_6region: 'south_asia'
        },
        {
          country: 'npl',
          landlocked: 'landlocked',
          world_6region: 'south_asia'
        },
        {
          country: 'pak',
          landlocked: 'coastline',
          world_6region: 'south_asia'
        }
      ]);
    });
  });

  describe('should be produced only for \'select\' section', () => {

    it('when \'key\' property has item that is absent in dataset', async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        select: {
          key: [ 'failed_concept' ],
          value: [ 'company_scale', 'english_speaking' ]
        },
        from: 'entities'
      };

      await expectPromiseRejection({
        promiseFunction: reader.read.bind(reader),
        args: [ query ],
        expectedErrors: [ selectKeyClauseContainsUnavailableItems ],
        type: 'definitions'
      });
    });

    it('when \'key\' property has many items (structure error)', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
        from: 'entities', select: { key: [ 'geo', 'failed_concept' ] }
      };

      await expectPromiseRejection({
        promiseFunction: reader.read.bind(reader),
        args: [ query ],
        expectedErrors: [ selectKeyClauseMustHaveOnly1Item ],
        type: 'structure'
      });
    });

    it('when debug mode and  \'value\' property has items that is absent in dataset', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'entities',
        debug: true,
        select: {
          key: [ 'company' ],
          value: [ 'failed_concept', 'english_speaking', 'company_scale', 'failed_concept2', 'lines_of_code' ]
        }
      };

      await expectPromiseRejection({
        promiseFunction: reader.read.bind(reader),
        args: [ query ],
        expectedErrors: [ selectValueClauseContainsUnavailableItems1 ],
        type: 'definitions'
      });
    });

    it('when \'value\' property has items that is absent in dataset', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const query = {
        repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
        from: 'entities',
        select: {
          key: [ 'company' ],
          value: [ 'failed_concept', 'english_speaking', 'company_scale', 'failed_concept2', 'lines_of_code' ]
        }
      };

      const result = await reader.read(query);
      expect(result).to.be.deep.equal([]);
    });
  });
});
