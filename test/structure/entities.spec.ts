import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  checkExpectations,
  expectedError10,
  expectedError4,
  expectedError5,
  expectedError6,
  notExpectedError
} from '../common';

const expect = chai.expect;

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const EMPTY_TRANSLATIONS_PATH = './test/fixtures/empty-translations';

describe('Errors in entities query structure', () => {
  describe('should never happen for happy flow', () => {
    it(`when requests '${GLOBALIS_PATH}' dataset and 'ar-SA' language`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        language: 'ar-SA',
        select: {
          key: [ 'country' ],
          value: [
            'name'
          ]
        },
        from: 'entities',
        where: {
          $and: [
            { country: { $in: [ 'usa', 'dza', 'abkh', 'afg' ] } }
          ]
        },
        order_by: [ 'country' ]
      }).then(data => {
        expect(data.length).to.equal(4);

        done();
      }).catch((error) => {
        done(error);
      });
    });

    it(`when requests '${EMPTY_TRANSLATIONS_PATH}' dataset without 'en' language in datapackage.json`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: EMPTY_TRANSLATIONS_PATH });

      reader.read({
        from: 'entities',
        language: 'en',
        select: {
          key: [ 'concept' ],
          value: [ 'concept_type', 'name' ]
        },
        where: {}
      }).then(data => {
        expect(data.length).to.equal(595);

        done();
      });
    });

    it(`when requests only one column '${GLOBALIS_PATH}' dataset`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
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
      }).then(data => {
        expect(data.length).to.equal(4);

        done();
      }).catch((error) => {
        done(error);
      });
    });
  });

  describe('should be produced only for \'select.key\' section', () => {
    it('when it is not array', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: 'country',
          value: [ 'world_4region' ]
        },
        from: 'entities'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError5);
          expect(error.toString()).to.contain(expectedError10);
        }, done));
    });

    it('when it has 0 item', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: [],
          value: [ 'world_4region' ]
        },
        from: 'entities'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          expect(error.toString()).to.contain(expectedError10);
        }, done));
    });

    it('when it has 2 items', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        select: {
          key: ['country', 'un_state'],
          value: [ 'world_4region' ]
        },
        from: 'entities'
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          expect(error.toString()).to.contain(expectedError10);
        }, done));
    });
  });
});
