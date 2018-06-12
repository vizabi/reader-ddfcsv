import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BIG_PATH, checkExpectations,
  expectedError4,
  expectedError5,
  expectedError6,
  expectedError7,
  expectedError8,
  expectedError9,
  GLOBALIS_PATH,
  notExpectedError,
  POP_WPP_PATH,
  STATIC_ASSETS
} from '../common';

const expect = chai.expect;

describe('Errors in datapoints query definition', () => {
  describe('should be produced only for \'select\' section', () => {
    it('when \'key\' property has item that is absent in dataset', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'failed_concept', 'time' ], value: [ 'population_total' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.not.contain(expectedError5);
          expect(error.toString()).to.not.contain(expectedError6);
          expect(error.toString()).to.contain(expectedError7);
        }, done));
    });

    it('when \'value\' property has item that is absent in dataset', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: GLOBALIS_PATH });

      reader.read({ from: 'datapoints', select: { key: [ 'geo', 'time' ], value: [ 'failed_measure' ] } })
        .then(() => done(notExpectedError))
        .catch(checkExpectations((error) => {
          // console.log(error.stack);
          expect(error.toString()).to.not.contain(expectedError4);
          expect(error.toString()).to.contain(expectedError9);
        }, done));
    });
  });
});
