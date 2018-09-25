import * as chai from 'chai';
import * as sinon from 'sinon';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('High load queries', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('on population dataset', () => {
    it(`query with $nin clause should be processed correctly`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({
        path: './test/fixtures/ddf--gapminder--population.big/master-HEAD'
      });

      const result = await reader.read({
        language: 'en',
        from: 'datapoints',
        animatable: 'year',
        select: {
          key: [
            'geo',
            'year',
            'age'
          ],
          value: [
            'population'
          ]
        },
        where: {
          $and: [
            {
              geo: '$geo'
            },
            {
              age: '$age'
            }
          ]
        },
        join: {
          $geo: {
            key: 'geo',
            where: {
              $and: [
                {
                  $or: [
                    {
                      un_state: true
                    },
                    {
                      'is--global': true
                    },
                    {
                      'is--world_4region': true
                    }
                  ]
                },
                {
                  geo: {
                    $in: [
                      'world'
                    ]
                  }
                }
              ]
            }
          },
          $age: {
            key: 'age',
            where: {
              age: {
                $nin: [
                  '80plus',
                  '100plus'
                ]
              }
            }
          }
        },
        order_by: [
          'year'
        ]
      });

      expect(result.length).to.be.equal(14300);
    });
  });
});
