import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  checkExpectations,
  expectedError10, expectedError11, expectedError12, expectedError13,
  expectedError4,
  expectedError5,
  expectedError6,
  notExpectedError
} from '../common';

const expect = chai.expect;

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const EMPTY_TRANSLATIONS_PATH = './test/fixtures/empty-translations';

describe('Entities structure errors in query', () => {
  describe('should never happen for happy flow', () => {
    it(`when requests '${GLOBALIS_PATH}' dataset and 'ar-SA' language`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
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
      }).then(data => {
        expect(data.length).to.equal(4);

        done();
      }).catch(done);
    });

    it(`when requests '${GLOBALIS_PATH}' dataset without 'en' language in datapackage.json`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
        from: 'entities',
        language: 'test',
        select: {
          key: [ 'country' ],
          value: [ 'world_4region', 'un_state' ]
        },
        order_by: [ 'country', { world_4region: -1 } ]
      }).then(data => {
        expect(data.length).to.equal(273);

        done();
      }).catch(done);
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
      }).catch(done);
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
          key: [ 'country', 'un_state' ],
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

  describe('should be produced only for \'select.value\' section', () => {
    it('when it is not array or empty', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: GLOBALIS_PATH });

      reader.read({
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
      })
        .then(data => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          expect(error.toString()).to.not.contain(expectedError10);
          expect(error.toString()).to.contain(expectedError13);
        }, done));
    });
  });
});
