import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;

const GLOBALIS_PATH = './test/fixtures/systema_globalis';

describe('Concepts supporting', () => {
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
  it('an exception should be raced for request with an error', done => {
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

  it('an exception should be raced for empty request', done => {
    const reader = getDDFCsvReaderObject();

    reader.init({path: GLOBALIS_PATH});

    reader.read({}).then(data => {
      expect(data.length).to.not.equal(8);

      done();
    }).catch(err => {
      expect(!!err).to.be.true;

      done();
    });
  });
});
