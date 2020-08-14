import * as chai from 'chai';
import * as sinon from 'sinon';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;
const sandbox = sinon.createSandbox();

const data = {
  concepts: {
    first: {
      dataset: './test/static-fixtures/ddf--systema_globalis',
      fixture: 'concepts-sg.json',
      query: {
        select: {
          key: ['concept'],
          value: [
            'concept_type', 'name', 'domain'
          ]
        },
        from: 'concepts',
        where: {
          $and: [
            {concept_type: {$eq: 'entity_set'}}
          ]
        }
      }
    },
    second: {
      dataset: './test/static-fixtures/ddf--sodertornsmodellen',
      fixture: 'concepts-soderstornsmodellen.json',
      query: {
        select: {
          key: [
            'concept'
          ],
          value: []
        },
        from: 'concepts',
        where: {},
        language: 'en'
      }
    }
  },
  entities: {
    first: {
      dataset: './test/static-fixtures/ddf--systema_globalis',
      fixture: 'entities-sg.json',
      query: {
        from: 'entities',
        animatable: 'time',
        select: {
          key: ['geo'],
          value: ['name', 'world_4region', 'latitude', 'longitude']
        },
        where: {'is--country': true},
        grouping: {},
        orderBy: null
      }
    },
    second: {
      dataset: './test/static-fixtures/ddf--sodertornsmodellen',
      fixture: 'entities-soderstornsmodellen.json',
      query: {
        language: 'en',
        from: 'entities',
        animatable: false,
        select: {
          key: [
            'basomrade'
          ],
          value: [
            'name'
          ]
        },
        where: {},
        join: {},
        order_by: [
          'rank'
        ]
      }
    }
  },
  datapoints: {
    first: {
      dataset: './test/static-fixtures/ddf--systema_globalis',
      fixture: 'datapoints-sg.json',
      query: {
        from: 'datapoints',
        animatable: 'time',
        select: {
          key: ['geo', 'time'],
          value: ['life_expectancy_years', 'income_per_person_gdppercapita_ppp_inflation_adjusted', 'population_total']
        },
        where: {
          time: {$gt: 1800, $lt: 2016}
        },
        grouping: {},
        order_by: ['time', 'geo']
      }
    },
    second: {
      dataset: './test/static-fixtures/ddf--sodertornsmodellen',
      fixture: 'datapoints-soderstornsmodellen.json',
      query: {
        language: 'en',
        from: 'datapoints',
        animatable: 'year',
        select: {
          key: [
            'basomrade',
            'year'
          ],
          value: [
            'mean_income_aged_gt_20',
            'post_secondary_education_min_3_years_aged_25_64',
            'population_aged_gt_20'
          ]
        },
        where: {
          $and: [
            {
              basomrade: '$basomrade'
            },
            {
              year: '$year'
            }
          ]
        },
        join: {
          $basomrade: {
            key: 'basomrade',
            where: {
              municipality: {
                $in: [
                  '0192_nynashamn',
                  '0127_botkyrka',
                  '0136_haninge',
                  '0126_huddinge',
                  '0128_salem',
                  '0138_tyreso'
                ]
              }
            }
          },
          $year: {
            key: 'year',
            where: {
              year: '2000'
            }
          }
        },
        order_by: [
          'basomrade',
          'year'
        ]
      }
    }
  },
  schema: {
    first: {
      dataset: './test/static-fixtures/ddf--systema_globalis',
      fixture: 'schema-sg.json',
      query: {
        select: {
          key: ['key', 'value'],
          value: []
        },
        from: '*.schema'
      }

    },
    second: {
      dataset: './test/static-fixtures/ddf--sodertornsmodellen',
      fixture: 'schema-soderstornsmodellen.json',
      query: {
        select: {
          key: ['key', 'value'],
          value: []
        },
        from: '*.schema'
      }
    }
  }
};

function parseYear(resultFixture, concepts = ['year', 'time']) {
  for (const row of resultFixture) {
    for (const concept of concepts) {
      if (row[concept] && typeof row[concept] === 'string') {
        row[concept] = new Date(Date.UTC(row[concept], 0));
      }
    }
  }
}

async function testProcessing(first, second) {
  const result1Original = require(`./result-fixtures/multi-instances/${first.fixture}`);
  const result2Original = require(`./result-fixtures/multi-instances/${second.fixture}`);

  parseYear(result1Original);
  parseYear(result2Original);

  const reader1 = getDDFCsvReaderObject();
  reader1.init({path: first.dataset});
  const result1 = await reader1.read(first.query);

  const reader2 = getDDFCsvReaderObject();
  reader2.init({path: second.dataset});
  const result2 = await reader2.read(second.query);

  const reader = getDDFCsvReaderObject();

  const parallelActions = [
    new Promise(async resolve => {
      reader.init({path: first.dataset});
      resolve(await reader.read(first.query));
    }),
    new Promise(async resolve => {
      reader.init({path: second.dataset});
      resolve(await reader.read(second.query));
    })
  ];

  const [result11, result22] = await Promise.all(parallelActions);

  reader.init({path: first.dataset});
  const result111 = await reader.read(first.query);

  reader.init({path: second.dataset});
  const result222 = await reader2.read(second.query);

  expect(result1).to.be.deep.equal(result1Original);
  expect(result2).to.be.deep.equal(result2Original);

  expect(result1).to.be.deep.equal(result11);
  expect(result2).to.be.deep.equal(result22);

  expect(result1).to.be.deep.equal(result111);
  expect(result2).to.be.deep.equal(result222);
}

async function allTestsProcessing() {
  const originals = {
    conceptsFirst: require(`./result-fixtures/multi-instances/${data.concepts.first.fixture}`),
    conceptsSecond: require(`./result-fixtures/multi-instances/${data.concepts.second.fixture}`),
    entitiesFirst: require(`./result-fixtures/multi-instances/${data.entities.first.fixture}`),
    entitiesSecond: require(`./result-fixtures/multi-instances/${data.entities.second.fixture}`),
    datapointsFirst: require(`./result-fixtures/multi-instances/${data.datapoints.first.fixture}`),
    datapointsSecond: require(`./result-fixtures/multi-instances/${data.datapoints.second.fixture}`),
    schemaFirst: require(`./result-fixtures/multi-instances/${data.schema.first.fixture}`),
    schemaSecond: require(`./result-fixtures/multi-instances/${data.schema.second.fixture}`)
  };
  const queryTypes = ['concepts', 'entities', 'datapoints', 'schema'];
  const results = {};

  for (const prop in originals) {
    parseYear(originals[prop]);
  }

  for (const queryType of queryTypes) {
    const reader1 = getDDFCsvReaderObject();
    reader1.init({path: data[queryType].first.dataset});
    results[`${queryType}First`] = await reader1.read(data[queryType].first.query);

    expect(results[`${queryType}First`]).to.be.deep.equal(originals[`${queryType}First`]);

    const reader2 = getDDFCsvReaderObject();
    reader2.init({path: data[queryType].second.dataset});
    results[`${queryType}Second`] = await reader2.read(data[queryType].second.query);

    expect(results[`${queryType}Second`]).to.be.deep.equal(originals[`${queryType}Second`]);
  }

  const reader = getDDFCsvReaderObject();

  for (let i = 0; i < 1; i++) {
    const parallelActions = [];

    for (const queryType of queryTypes) {
      parallelActions.push(new Promise(async resolve => {
        reader.init({path: data[queryType].first.dataset});
        const content = await reader.read(data[queryType].first.query);
        resolve({type: `${queryType}First`, content});
      }));
      parallelActions.push(new Promise(async resolve => {
        reader.init({path: data[queryType].second.dataset});
        const content = await reader.read(data[queryType].second.query);
        resolve({type: `${queryType}Second`, content});
      }));
    }

    const asyncResults = await Promise.all(parallelActions);

    for (const asyncResult of asyncResults) {
      expect(asyncResult.content).to.be.deep.equal(originals[asyncResult.type]);
    }
  }
}

describe('Multi-instances queries', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it(`two multi-instances concepts queries`, async () => {
    await testProcessing(data.concepts.first, data.concepts.second);
  });

  it(`two multi-instances entities queries`, async () => {
    await testProcessing(data.entities.first, data.entities.second);
  });

  it(`two multi-instances datapoints queries`, async () => {
    await testProcessing(data.datapoints.first, data.datapoints.second);
  });

  it(`two multi-instances schema queries`, async () => {
    await testProcessing(data.schema.first, data.schema.second);
  });

  it(`all kinds schema queries on the same time`, async () => {
    await allTestsProcessing();
  });

});
