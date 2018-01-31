import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;

const GLOBALIS_PATH = './test/fixtures/systema_globalis';

describe('Datapoints supporting', () => {
  it('condition under join supporting', done => {
    const reader = getDDFCsvReaderObject();

    reader.init({path: GLOBALIS_PATH});

    reader.read({
      select: {
        key: ['geo', 'time'],
        value: [
          'life_expectancy_years', 'population_total'
        ]
      },
      from: 'datapoints',
      where: {
        $and: [
          {geo: '$geo'},
          {time: '$time'},
          {
            $or: [
              {population_total: {$gt: 10000}},
              {life_expectancy_years: {$gt: 30, $lt: 70}}
            ]
          }
        ]
      },
      join: {
        $geo: {
          key: 'geo',
          where: {
            $and: [
              {'is--country': true},
              {latitude: {$lte: 0}}
            ]
          }
        },
        $time: {
          key: 'time',
          where: {$and: [{time: {$gt: '1990', $lte: '2015'}}]}
        }
      },
      order_by: ['time', 'geo']
    }).then(data => {
      const countryAntData = data.filter(record => record.geo === 'ant');

      expect(data.length).to.equal(1155);
      expect(countryAntData).to.be.an('array').that.is.empty;

      done();
    });
  });
});
