import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  checkExpectations,
  selectKeyClauseMustHaveOnly1Item,
  selectValueClauseMustHaveCertainStructure,
  selectValueClauseMustHaveCertainStructureInSchemaQueries,
  joinClauseShouldnotBeInSchemaQueries,
  languageClauseShouldnotBeInSchemaQueries,
  selectClauseCouldnotBeEmpty,
  selectClauseMustHaveStructure,
  notExpectedError,
  selectKeyClauseMustHaveOnly2ItemsInSchemaQueries, EXPECTS_EXACTLY_ONE_ERROR, getAmountOfErrors
} from '../common';

const expect = chai.expect;

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const EMPTY_TRANSLATIONS_PATH = './test/fixtures/empty-translations';

describe('Schemas structure errors in query', () => {
  describe('should never happen for happy flow', () => {
    it(`when requests \'concepts.schema\' in \'${GLOBALIS_PATH}\' dataset with no \'select.value\'`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: [ 'key', 'value' ]
        },
        from: 'concepts.schema',
        order_by: [ 'key', { value: 1 } ]
      })
        .then((data) => {
          expect(data.length).to.equal(15);
          return done();
        })
        .catch(done);
    });

    it(`when requests \'concepts.schema\' in \'${GLOBALIS_PATH}\' dataset with empty \'select.value\'`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: [ 'key', 'value' ],
          value: []
        },
        from: 'concepts.schema'
      })
        .then((data) => {
          expect(data.length).to.equal(15);
          return done();
        })
        .catch(done);
    });

    it(`when requests \'entities.schema\' in \'${GLOBALIS_PATH}\' dataset with \'select.value\'`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: [ 'key', 'value' ],
          value: ['value']
        },
        from: 'entities.schema'
      })
        .then((data) => {
          expect(data.length).to.equal(118);
          return done();
        })
        .catch(done);
    });

    it(`when requests \'datapoints.schema\' in \'${GLOBALIS_PATH}\' dataset with \'select.value\'`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: [ 'key', 'value' ],
          value: ['value']
        },
        from: 'datapoints.schema'
      })
        .then((data) => {
          expect(data.length).to.equal(1064);
          return done();
        })
        .catch(done);
    });

    it(`when requests \'*.schema\' in \'${GLOBALIS_PATH}\' dataset with \'select.value\'`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: [ 'key', 'value' ],
          value: ['value']
        },
        from: '*.schema'
      })
        .then((data) => {
          expect(data.length).to.equal(1197);
          return done();
        })
        .catch(done);
    });
  });

  describe('should be produced only for \'select.key\' section', () => {
    it('when it is not array', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: 'key',
          value: [ 'value' ]
        },
        from: 'concepts.schema'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseMustHaveOnly2ItemsInSchemaQueries);
        }, done));
    });

    it('when it has 0 item', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: [],
          value: [ 'value' ]
        },
        from: 'concepts.schema'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseMustHaveOnly2ItemsInSchemaQueries);
        }, done));
    });

    it('when it has 1 item', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: ['value'],
          value: [ 'value' ]
        },
        from: 'concepts.schema'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseMustHaveOnly2ItemsInSchemaQueries);
        }, done));
    });
  });

  describe('should be produced only for \'select.value\' section', () => {
    it('when it is not array or empty', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: ['key', 'value'],
          value: 'value'
        },
        from: 'concepts.schema'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectValueClauseMustHaveCertainStructureInSchemaQueries);
        }, done));
    });
  });

  describe('should be produced only for \'language\' section', () => {
    it('when it is present', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: ['key', 'value']
        },
        from: '*.schema',
        language: ''
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(languageClauseShouldnotBeInSchemaQueries);
        }, done));
    });
  });

  describe('should be produced only for \'join\' section', () => {
    it('when it is present', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: ['key', 'value']
        },
        from: 'concepts.schema',
        join: ''
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(joinClauseShouldnotBeInSchemaQueries);
        }, done));
    });
  });
});
