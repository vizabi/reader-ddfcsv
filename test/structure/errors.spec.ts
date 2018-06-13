import * as chai from 'chai';
import * as sinon from 'sinon';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  checkExpectations,
  expectedError1,
  expectedError18,
  expectedError19,
  expectedError2, expectedError20, expectedError21,
  expectedError3,
  expectedError4,
  expectedError5,
  notExpectedError
} from '../common';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const BROKEN_DATAPACKAGE_PATH = './test/fixtures/ds_broken_datapackage';

describe('General structure errors in query', () => {
  afterEach(() => sandbox.restore());

  describe('should be produced only for \'from\' section', () => {
    it('when query is empty', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({})
        .then(() => {
          return done(notExpectedError);
        })
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.contain(expectedError1);
          expect(error.toString()).to.contain(expectedError2);
          expect(error.toString()).to.contain(expectedError3);
          expect(error.toString()).to.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
        }, done));
    });

    it('when section \'from\' is absent', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.contain(expectedError1);
          expect(error.toString()).to.contain(expectedError2);
          expect(error.toString()).to.contain(expectedError3);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
        }, done));
    });

    it('when section \'from\' is object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: {}, select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError1);
          expect(error.toString()).to.contain(expectedError2);
          expect(error.toString()).to.contain(expectedError3);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
        }, done));
    });

    it('when section \'from\' doesn\'t have available value', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'fail', select: { key: [ 'geo', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError1);
          expect(error.toString()).to.not.contain(expectedError2);
          expect(error.toString()).to.contain(expectedError3);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
        }, done));
    });
  });

  describe('should be produced only for \'select\' section', () => {
    it('when it is absent', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError5);
        }, done));
    });

    it('when it is empty', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: {} })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError5);
        }, done));
    });

    it('when it is not object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: 'fail' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError5);
        }, done));
    });
  });

  describe('should be produced only for \'language\' section', () => {
    it('when it is not string', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ language: [], select: { key: [ 'concept' ] }, from: 'concepts' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.contain(expectedError18);
        }, done));
    });
  });

  describe('should be produced only for \'join\' section', () => {
    it('when it is not object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ join: [], select: { key: [ 'concept' ] }, from: 'concepts' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.contain(expectedError19);
        }, done));
    });
  });

  describe('should be produced only for \'where\' section', () => {
    it('when it is not object', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ where: [], select: { key: [ 'concept' ] }, from: 'concepts' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.contain(expectedError20);
        }, done));
    });
  });

  describe('should be produced only for \'order_by\' section', () => {
    it('when it is not string or array of strings or array of objects', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ order_by: {}, select: { key: [ 'concept' ] }, from: 'concepts' })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.contain(expectedError21);
        }, done));
    });
  });

});
