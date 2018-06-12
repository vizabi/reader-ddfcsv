import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';

const expect = chai.expect;

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const EMPTY_TRANSLATIONS_PATH = './test/fixtures/empty-translations';

describe('Schemas supporting', () => {
  it('schema queries supporting  with empty select.value section from concepts.schema', done => {
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

  it('schema queries supporting with no select.value section from concepts.schema', done => {
    const reader = getDDFCsvReaderObject();

    reader.init({ path: GLOBALIS_PATH });

    reader.read({
      select: {
        key: [ 'key', 'value' ]
      },
      from: 'concepts.schema'
    })
      .then((data) => {
        expect(data.length).to.equal(15);
        return done();
      })
      .catch(done);
  });

  it('schema queries supporting with select.value section from entities.schema', done => {
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

  it('schema queries supporting with select.value section from datapoints.schema', done => {
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

  it('schema queries supporting with select.value section from *.schema', done => {
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
