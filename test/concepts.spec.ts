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
});
