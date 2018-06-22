import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import { BASE_PATH } from '../common';

const expect = chai.expect;

describe('Concepts definition errors in query', () => {
  describe('should be produced only for \'select\' section', () => {
    it('when \'key\' property has item that is absent in dataset', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

      reader.read({
        select: {
          key: [ 'wrong_concept' ],
          value: [ 'concept_type', 'name', 'description' ]
        },
        from: 'concepts'
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
