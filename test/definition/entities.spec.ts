import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';

const expect = chai.expect;

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const EMPTY_TRANSLATIONS_PATH = './test/fixtures/empty-translations';

describe('Errors in entities query definition', () => {
  describe('should be produced only for \'select\' section', () => {
    it('when \'key\' property has item that is absent in dataset', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({path: GLOBALIS_PATH});

      reader.read({
        select: {
          key: ['wrong_concept'],
          value: [
            'concept_type', 'name', 'description'
          ]
        },
        from: 'entities',
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
  });
});
