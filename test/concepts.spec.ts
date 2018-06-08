import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;
import {
  BIG_PATH,
  expectedError1,
  expectedError2,
  expectedError3,
  expectedError4,
  expectedError5,
  GLOBALIS_PATH,
  notExpectedError,
  POP_WPP_PATH,
  STATIC_ASSETS
} from './common';

const EMPTY_TRANSLATIONS_PATH = './test/fixtures/empty-translations';

describe('Concepts supporting', () => {
  describe('# happy flow', () => {
    it('translation supporting', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({path: GLOBALIS_PATH});

      reader.read({
        language: 'ar-SA',
        select: {
          key: ['concept'],
          value: [
            'concept_type', 'name', 'description'
          ]
        },
        from: 'concepts',
        where: {
          $and: [
            {concept_type: {$eq: 'entity_set'}}
          ]
        },
        order_by: ['concept']
      }).then(data => {
        expect(data.length).to.equal(8);

        done();
      });
    });
  });

  describe('# sad flow', () => {
    it('an exception should be raised for request with an error', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({path: GLOBALIS_PATH});

      reader.read({
        select: {
          key: ['wrong_concept'],
          value: [
            'concept_type', 'name', 'description'
          ]
        },
        from: 'concepts',
        where: {
          $and: [
            {concept_type: {$eq: 'entity_set'}}
          ]
        },
        order_by: ['concept']
      }).then(data => {
        expect(data.length).to.not.equal(8);

        done();
      }).catch(err => {
        expect(err).to.not.be.null;

        done();
      });
    });

    it('an exception should be raised for empty request', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({path: GLOBALIS_PATH});

      reader.read({}).then(() => {
        done(notExpectedError);
      }).catch(error => {
        expect(error.toString()).to.contain(expectedError1);
        expect(error.toString()).to.contain(expectedError2);
        expect(error.toString()).to.contain(expectedError3);
        expect(error.toString()).to.contain(expectedError4);
        expect(error.toString()).to.not.contain(expectedError5);

        done();
      });
    });

    it('any exception should NOT be raised in case of empty translations section in datapackage.json', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({path: EMPTY_TRANSLATIONS_PATH});

      reader.read({
        from: 'concepts',
        language: 'en',
        select: {
          key: ['concept'],
          value: ['concept_type', 'name']
        },
        where: {}
      }).then(data => {
        expect(data.length).to.equal(595);

        done();
      }).catch(error => done(error));
    });
  });
});
