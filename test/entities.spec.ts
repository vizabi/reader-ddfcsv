import * as chai from 'chai';
import {BackendFileReader, Ddf} from '../src/index';

const backendFileReader = new BackendFileReader();
const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const GLOBALIS_TINY_PATH = './test/fixtures/systema_globalis_tiny';

const expect = chai.expect;

describe('when entities checking', () => {
  it('plain query should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      from: 'entities',
      animatable: 'time',
      select: {
        key: ['geo'],
        value: ['name', 'world_4region']
      },
      where: {'is--country': true},
      grouping: {},
      orderBy: null
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 275;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      data.forEach(record => {
        expect(record.geo).to.equal(record.country);
      });

      done();
    });
  });

  it('shapes query should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      from: 'entities',
      animatable: false,
      select: {key: ['geo'], value: ['name', 'shape_lores_svg']},
      where: {'geo.is--world_4region': true},
      grouping: {},
      orderBy: null
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 4;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('tags query should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      from: 'entities',
      animatable: false,
      select: {key: ['tag'], value: ['name', 'parent']},
      where: {},
      grouping: {},
      orderBy: null
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 84;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('schema query should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      from: 'entitiesSchema',
      select: {
        key: ['geo', 'country'],
        value: []
      },
      where: {},
      grouping: {},
      orderBy: null
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 4;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('query for "world_4region" should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_TINY_PATH, backendFileReader);
    const request = {
      language: 'en',
      from: 'entities',
      animatable: false,
      select: {key: ['world_4region'], value: ['name', 'rank', 'shape_lores_svg']},
      where: {},
      join: {},
      order_by: ['rank']
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 4;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      data.forEach(record => {
        expect(!!record.world_4region).to.be.true;
      });

      done();
    });
  });


  it('domain as primary key based query should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      language: "en",
      from: "entities",
      animatable: false,
      select: {
        key: [
          'world_4region'
        ],
        value: [
          'name',
          'rank',
          'shape_lores_svg'
        ]
      },
      where: {},
      join: {},
      order_by: [
        'rank'
      ]
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 4;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });
});
