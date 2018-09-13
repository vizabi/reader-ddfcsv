import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  EXPECTS_EXACTLY_ONE_ERROR,
  getAmountOfErrors,
  GLOBALIS_PATH,
  joinClauseShouldnotBeInSchemaQueries,
  languageClauseShouldnotBeInSchemaQueries,
  notExpectedError,
  selectKeyClauseMustHaveOnly2ItemsInSchemaQueries,
  selectValueClauseMustHaveCertainStructureInSchemaQueries
} from '../common';

const expect = chai.expect;

describe('Schemas structure errors in query', () => {
  describe('should never happen for happy flow', () => {
    it(`when requests \'concepts.schema\' in \'${BASE_PATH + GLOBALIS_PATH}\' dataset with no \'select.value\'`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
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

      reader.init({ path: BASE_PATH });

      const query = {
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

      reader.init({ path: BASE_PATH });

      const query = {
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

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: [ 'key', 'value' ],
          value: [ 'value' ]
        },
        from: 'datapoints.schema'
      };
      const result = await reader.read(query);
      expect(result.length).to.equal(1076);
    });

    it(`when requests \'*.schema\' in \'${BASE_PATH + GLOBALIS_PATH}\' dataset with \'select.value\'`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: [ 'key', 'value' ],
          value: [ 'value' ]
        },
        from: '*.schema'
      };
      const result = await reader.read(query);
      expect(result.length).to.equal(1209);
    });
  });

  describe('should be produced only for \'select.key\' section', () => {
    it('when it is not array', async () => {
      let actualError;
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: 'key',
          value: [ 'value' ]
        },
        from: 'concepts.schema'
      };
      try {
        await reader.read(query);

        throw new Error(notExpectedError);
      } catch (error) {
        actualError = error;
      } finally {
        // console.log(error.stack);
        expect(getAmountOfErrors(actualError)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualError.toString()).to.match(selectKeyClauseMustHaveOnly2ItemsInSchemaQueries);
      }
    });

    it('when it has 0 item', async () => {
      let actualError;
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: [],
          value: [ 'value' ]
        },
        from: 'concepts.schema'
      };

      try {
        await reader.read(query);

        throw new Error(notExpectedError);
      } catch (error) {
        actualError = error;
      } finally {
        // console.log(error.stack);
        expect(getAmountOfErrors(actualError)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualError.toString()).to.match(selectKeyClauseMustHaveOnly2ItemsInSchemaQueries);
      }
    });

    it('when it has 1 item', async () => {
      let actualError;
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: [ 'value' ],
          value: [ 'value' ]
        },
        from: 'concepts.schema'
      };
      try {
        await reader.read(query);

        throw new Error(notExpectedError);
      } catch (error) {
        actualError = error;
      } finally {
        // console.log(error.stack);
        expect(getAmountOfErrors(actualError)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualError.toString()).to.match(selectKeyClauseMustHaveOnly2ItemsInSchemaQueries);
      }
    });
  });

  describe('should be produced only for \'select.value\' section', () => {
    it('when it is not array or empty', async () => {
      let actualError;
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: [ 'key', 'value' ],
          value: 'value'
        },
        from: 'concepts.schema'
      };
      try {
        await reader.read(query);

        throw new Error(notExpectedError);
      } catch (error) {
        actualError = error;
      } finally {
        // console.log(error.stack);
        expect(getAmountOfErrors(actualError)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualError.toString()).to.match(selectValueClauseMustHaveCertainStructureInSchemaQueries);
      }
    });
  });

  describe('should be produced only for \'language\' section', () => {
    it('when it is present', async () => {
      let actualError;
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: [ 'key', 'value' ]
        },
        from: '*.schema',
        language: ''
      };

      try {
        await reader.read(query);

        throw new Error(notExpectedError);
      } catch (error) {
        actualError = error;
      } finally {
        // console.log(error.stack);
        expect(getAmountOfErrors(actualError)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualError.toString()).to.match(languageClauseShouldnotBeInSchemaQueries);
      }
    });
  });

  describe('should be produced only for \'join\' section', () => {
    it('when it is present', async () => {
      let actualError;
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      const query = {
        select: {
          key: [ 'key', 'value' ]
        },
        from: 'concepts.schema',
        join: ''
      };
      try {
        await reader.read(query);

        throw new Error(notExpectedError);
      } catch (error) {
        actualError = error;
      } finally {
        // console.log(error.stack);
        expect(getAmountOfErrors(actualError)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
        expect(actualError.toString()).to.match(joinClauseShouldnotBeInSchemaQueries);
      }
    });
  });
});
