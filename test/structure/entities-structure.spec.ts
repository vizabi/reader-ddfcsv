import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../../src/index';
import {
  BASE_PATH,
  checkExpectations,
  EXPECTS_EXACTLY_ONE_ERROR,
  EXPECTS_EXACTLY_TWO_ERRORS,
  getAmountOfErrors,
  GLOBALIS_PATH,
  notExpectedError,
  selectClauseMustHaveStructure,
  selectKeyClauseMustHaveOnly1Item,
  selectValueClauseMustHaveCertainStructure
} from '../common';

const expect = chai.expect;

describe('Entities structure errors in query', () => {
  describe('should never happen for happy flow', () => {
    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset and 'ar-SA' language`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

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

    it(`when requests '${BASE_PATH + GLOBALIS_PATH}' dataset without 'en' language in datapackage.json`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

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

    it(`when requests only one column '${BASE_PATH + GLOBALIS_PATH}' dataset`, done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

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

    it('when requests entities with where clause', function(done: Function): void {
      const reader = getDDFCsvReaderObject();
      reader.init({ path: BASE_PATH });

      reader.read({
        where: { world_6region: '$world_6region' },
        select: { key: [ 'country' ], value: [ 'world_6region', 'gapminder_list', 'god_id', 'landlocked' ] },
        from: 'entities',
        join: {
          $world_6region: {
            key: 'world_6region',
            where: {
              rank: { $eq: 2 }
            }
          }
        }
      })
        .then((result) => {
          expect(result).to.be.deep.equal([
            {
              country: 'afg',
              gapminder_list: 'Afghanistan',
              god_id: 'AF',
              landlocked: 'landlocked',
              world_6region: 'south_asia'
            },
            {
              country: 'bgd',
              gapminder_list: 'Bangladesh',
              god_id: 'BD',
              landlocked: 'coastline',
              world_6region: 'south_asia'
            },
            {
              country: 'btn',
              gapminder_list: 'Bhutan',
              god_id: 'BT',
              landlocked: 'landlocked',
              world_6region: 'south_asia'
            },
            {
              country: 'ind',
              gapminder_list: 'India',
              god_id: 'IN',
              landlocked: 'coastline',
              world_6region: 'south_asia'
            },
            {
              country: 'lka',
              gapminder_list: 'Sri Lanka',
              god_id: 'LK',
              landlocked: 'coastline',
              world_6region: 'south_asia'
            },
            {
              country: 'mdv',
              gapminder_list: 'Maldives',
              god_id: 'MV',
              landlocked: 'coastline',
              world_6region: 'south_asia'
            },
            {
              country: 'npl',
              gapminder_list: 'Nepal',
              god_id: 'NP',
              landlocked: 'landlocked',
              world_6region: 'south_asia'
            },
            {
              country: 'pak',
              gapminder_list: 'Pakistan',
              god_id: 'PK',
              landlocked: 'coastline',
              world_6region: 'south_asia'
            }
          ]);
          return done();
        })
        .catch(done);
    });
  });

  describe('should be produced only for \'select.key\' section', () => {
    it('when it is not array', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

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
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_TWO_ERRORS);
          expect(error.toString()).to.match(selectClauseMustHaveStructure);
          expect(error.toString()).to.match(selectKeyClauseMustHaveOnly1Item);
        }, done));
    });

    it('when it has 0 item', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

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
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseMustHaveOnly1Item);
        }, done));
    });

    it('when it has 2 items', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

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
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectKeyClauseMustHaveOnly1Item);
        }, done));
    });
  });

  describe('should be produced only for \'select.value\' section', () => {
    it('when it is not array or empty', done => {
      const reader = getDDFCsvReaderObject();

      reader.init({ path: BASE_PATH });

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
          expect(getAmountOfErrors(error)).to.equals(EXPECTS_EXACTLY_ONE_ERROR);
          expect(error.toString()).to.match(selectValueClauseMustHaveCertainStructure);
        }, done));
    });
  });
});
