import * as chai from 'chai';
import * as sinon from 'sinon';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('HL', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('optimization', () => {
    xit(`---------------------`, async () => {
      const reader = getDDFCsvReaderObject();

      reader.init({
        path: './test/fixtures/ddf--gapminder--population.big/master-HEAD'
      });

      // console.time('foo');

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

      // console.log(result.length);
      // console.timeEnd('foo');
    });
  });
});
