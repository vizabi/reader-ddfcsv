import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  checkExpectations,
  EMPTY_TRANSLATIONS_PATH,
  EXPECTS_EXACTLY_ONE_ERROR,
  EXPECTS_EXACTLY_TWO_ERRORS,
  getAmountOfErrors,
  GLOBALIS_PATH,
  notExpectedError,
  selectClauseMustHaveStructure,
  selectKeyClauseMustHaveOnly1Item,
  selectValueClauseMustHaveCertainStructure
} from '../common';

const expect = chai.expect;

describe('Concepts structure errors in query', () => {
  describe('should never happen for happy flow', () => {
    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and 'ar-SA' language`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      reader.read({
        language: 'ar-SA',
        select: {
          key: [ 'concept' ],
          value: [
            'concept_type', 'name', 'description'
          ]
        },
        from: 'concepts',
        where: {
          $and: [
            { concept_type: { $eq: 'entity_set' } }
          ]
        },
        order_by: [ 'concept', { description: 'asc' } ]
      }).then(data => {
        expect(data.length).to.equal(8);

        done();
      });
    });

    it(`when requests \'${BASE_PATH + EMPTY_TRANSLATIONS_PATH}\' dataset without \'en\' language in datapackage.json`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH, datasetsConfig: {
          [ EMPTY_TRANSLATIONS_PATH ]: { master: [ 'HEAD' ] },
          default: { dataset: EMPTY_TRANSLATIONS_PATH, branch: 'master', commit: 'HEAD' }
        }
      });

      reader.read({
        from: 'concepts',
        language: 'en',
        select: {
          key: [ 'concept' ],
          value: [ 'concept_type', 'name' ]
        },
        where: {},
        dataset: EMPTY_TRANSLATIONS_PATH
      }).then(data => {
        expect(data.length).to.equal(595);

        done();
      }).catch(error => done(error));
    });

    it(`when requests only one column '${BASE_PATH + GLOBALIS_PATH}' dataset with no \'select.value\'`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      reader.read({
        select: {
          key: [ 'concept' ]
        },
        from: 'concepts',
        where: {},
        order_by: [ 'concept' ]
      }).then(data => {
        expect(data.length).to.not.equal(8);

        done();
      }).catch(err => {
        expect(err).to.not.be.null;

        done();
      });
    });

    it(`when requests only one column '${BASE_PATH + GLOBALIS_PATH}' dataset with empty \'select.value\'`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      reader.read({
        select: {
          key: [ 'concept' ],
          value: []
        },
        from: 'concepts',
        where: {},
        order_by: [ 'concept' ]
      }).then(data => {
        expect(data.length).to.not.equal(8);

        done();
      }).catch(err => {
        expect(err).to.not.be.null;

        done();
      });
    });
  });

  describe('should be produced only for \'select.key\' section', () => {
    it('when it is not array', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      reader.read({
        select: {
          key: 'concept',
          value: [ 'concept_type', 'name', 'description' ]
        },
        from: 'concepts'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_TWO_ERRORS);
          expect(error.toString()).to.match(selectClauseMustHaveStructure);
          expect(error.toString()).to.match(selectKeyClauseMustHaveOnly1Item);
        }, done));
    });

    it('when it has 0 item', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      reader.read({
        select: {
          key: [],
          value: [ 'concept_type', 'name', 'description' ]
        },
        from: 'concepts'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseMustHaveOnly1Item);
        }, done));
    });

    it('when it has 2 items', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      reader.read({
        select: {
          key: [ 'concept', 'un_state' ],
          value: [ 'concept_type', 'name', 'description' ]
        },
        from: 'concepts'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseMustHaveOnly1Item);
        }, done));
    });
  });

  describe('should be produced only for \'select.value\' section', () => {
    it('when it is not array or empty', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      reader.read({
        select: {
          key: [ 'concept' ],
          value: 'concept_type'
        },
        from: 'concepts'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectValueClauseMustHaveCertainStructure);
        }, done));
    });
  });
});
