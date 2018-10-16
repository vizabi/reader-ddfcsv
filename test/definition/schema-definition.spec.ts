import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH, expectPromiseRejection,
  EXPECTS_EXACTLY_ONE_ERROR,
  getAmountOfErrors, GLOBALIS_PATH,
  notExpectedError,
  selectKeyClauseContainsUnavailableItems, selectValueClauseContainsUnavailableItems1,
  selectValueClauseContainsUnavailableItems2,
  tooManyQueryDefinitionErrors, WS_TESTING_PATH
} from '../common';
import { CONCEPTS, DATAPOINTS, ENTITIES } from 'ddf-query-validator';

const expect = chai.expect;

describe('Schemas definition errors in query', () => {
  describe('should never happen for happy flow', () => {
    it(`when requests \'concepts.schema\' in \'${BASE_PATH + GLOBALIS_PATH}\' dataset with no \'select.value\'`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ });

      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
        select: {
          key: [ 'key', 'value' ]
        },
        from: 'concepts.schema',
        order_by: [ 'key', { value: 1 } ]
      };
      const result = await reader.read(query);

      expect(result.length).to.equal(15);
    });

    it(`when requests \'concepts.schema\' in \'${BASE_PATH + GLOBALIS_PATH}\' dataset with empty \'select.value\'`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ });

      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
        select: {
          key: [ 'key', 'value' ],
          value: []
        },
        from: 'concepts.schema'
      };
      const result = await reader.read(query);
      expect(result.length).to.equal(15);
    });

    it(`when requests \'entities.schema\' in \'${BASE_PATH + GLOBALIS_PATH}\' dataset with \'select.value\'`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ });

      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
        select: {
          key: [ 'key', 'value' ],
          value: [ 'value' ]
        },
        from: 'entities.schema'
      };
      const result = await reader.read(query);
      expect(result.length).to.equal(118);
    });

    it(`when requests \'datapoints.schema\' in \'${BASE_PATH + GLOBALIS_PATH}\' dataset with \'select.value\'`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ });

      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
        select: {
          key: [ 'key', 'value' ],
          value: [ 'value' ]
        },
        from: 'datapoints.schema'
      };
      const result = await reader.read(query);
      expect(result.length).to.equal(1070);
    });

    it(`when requests \'*.schema\' in \'${BASE_PATH + GLOBALIS_PATH}\' dataset with \'select.value\'`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ });

      const query = {
        repositoryPath: BASE_PATH + GLOBALIS_PATH + '/master-HEAD',
        select: {
          key: [ 'key', 'value' ],
          value: [ 'value' ]
        },
        from: '*.schema'
      };
      const result = await reader.read(query);
      expect(result.length).to.equal(1203);
    });
  });

  describe('should be produced only for \'select\' section', () => {
    [ DATAPOINTS, ENTITIES, CONCEPTS ].forEach((queryType: string) => {
      it(`when \'from\' equals to ${queryType} and \'key\' property has item that is absent in dataset`, async () => {
        const reader = getDDFCsvReaderObject();

        reader.init({ });

        const query = {
          repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
          select: {
            key: [ 'failed_concept', 'value' ]
          },
          from: `${queryType}.schema`
        };

        await expectPromiseRejection({
          promiseFunction: reader.read.bind(reader),
          args: [ query ],
          expectedErrors: [ selectKeyClauseContainsUnavailableItems ],
          type: 'definitions'
        });
      });

      it(`when \'from\' equals to ${queryType} \'value\' property has item that is absent in dataset`, async () => {
        const reader = getDDFCsvReaderObject();

        reader.init({ });

        const query = {
          repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
          select: {
            key: [ 'key', 'value' ],
            value: [ 'failed_concept', 'key', 'failed_concept2', 'value', 'concept' ]
          },
          from: `${queryType}.schema`
        };

        const result = await reader.read(query);
        expect(result).to.be.not.empty;
      });

      it(`when debug mode and \'from\' equals to ${queryType} \'value\' property has item that is absent in dataset`, async () => {
        const reader = getDDFCsvReaderObject();

        reader.init({ });

        const query = {
          repositoryPath: BASE_PATH + WS_TESTING_PATH + '/master-HEAD',
          debug: true,
          select: {
            key: [ 'key', 'value' ],
            value: [ 'failed_concept', 'key', 'failed_concept2', 'value', 'concept' ]
          },
          from: `${queryType}.schema`
        };

        await expectPromiseRejection({
          promiseFunction: reader.read.bind(reader),
          args: [ query ],
          expectedErrors: [ selectValueClauseContainsUnavailableItems2 ],
          type: 'definitions'
        });
      });
    });
  });
});
