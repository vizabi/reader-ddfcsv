import * as chai from 'chai';
import { cloneDeep } from 'lodash';
import { parallel } from 'async';
import { isNumber } from 'lodash';
import { BackendFileReader, Ddf } from '../src/index';

const backendFileReader = new BackendFileReader();
const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const GLOBALIS_TINY_PATH = './test/fixtures/systema_globalis_tiny';
const PRESENTATION_SET = './test/fixtures/presentation_set';

const expect = chai.expect;

describe('when entities checking', () => {
  it('plain query should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      from: 'entities',
      animatable: 'time',
      select: {
        key: ['geo'],
        value: ['name', 'world_4region', 'latitude', 'longitude']
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

        if (record.longitude !== null) {
          expect(isNumber(record.longitude)).to.be.true;
        }

        if (record.latitude !== null) {
          expect(isNumber(record.latitude)).to.be.true;
        }
      });

      done();
    });
  });

  it('plain query for "ar-SA" language should be processed correctly', done => {
    const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
    const request = {
      language: 'ar-SA',
      from: 'entities',
      animatable: 'time',
      select: {
        key: ['geo'],
        value: ['name', 'world_4region', 'latitude', 'longitude']
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

        if (record.longitude !== null) {
          expect(isNumber(record.longitude)).to.be.true;
        }

        if (record.latitude !== null) {
          expect(isNumber(record.latitude)).to.be.true;
        }
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

  it('query with boolean condition should be processed correctly', done => {
    const ddf = new Ddf('./test/fixtures/presentation_set', backendFileReader);
    const request = {
      language: 'en',
      from: 'entities',
      animatable: 'time',
      select: {
        key: [
          'geo'
        ],
        value: [
          'name',
          'world_4region'
        ]
      },
      where: {
        $and: [
          {
            'un_state': true
          }
        ]
      },
      join: {},
      order_by: [
        'rank'
      ]
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 195;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('query with boolean condition should be processed correctly', done => {
    const ddf = new Ddf('./test/fixtures/sankey', backendFileReader);
    const request = {
      language: 'en',
      from: 'entities',
      animatable: false,
      select: {
        key: [
          'phase_from'
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
    };

    ddf.ddfRequest(request, (err, data) => {
      const EXPECTED_RECORDS_COUNT = 23;

      expect(!!err).to.be.false;
      expect(data.length).to.equal(EXPECTED_RECORDS_COUNT);

      done();
    });
  });

  it('should filters work properly ', done => {
    const EXPECTED_UNSTATE_QUANTITY = 195;
    const EXPECTED_NON_UNSTATE_QUANTITY = 78;
    const EXPECTED_UNSTATE_LESS_QUANTITY = 23;
    const requestTemplate = {
      language: 'en',
      from: 'entities',
      animatable: 'time',
      select: {
        key: [
          'geo'
        ],
        value: [
          'name',
          'world_4region'
        ]
      },
      where: {},
      join: {},
      order_by: [
        'rank'
      ]
    };

    const getExpectedAction = (whereClause) => onGotResult => {
      const ddf = new Ddf(PRESENTATION_SET, backendFileReader);
      const request = cloneDeep(requestTemplate);

      request.where = whereClause;

      ddf.ddfRequest(request, (err, data: any[]) => onGotResult(err, data));
    };

    parallel({
      allEntities: getExpectedAction({}),
      unStateEntities: getExpectedAction({$and: [{'un_state': true}]}),
      nonUnStateEntities: getExpectedAction({$and: [{'un_state': false}]}),
      unStateLessEntities: getExpectedAction({$and: [{'un_state': {$exists: false}}]})
    }, (err, results) => {
      expect(!!err).to.be.false;
      expect((<any[]>results.nonUnStateEntities).length).to.equal(EXPECTED_NON_UNSTATE_QUANTITY);
      expect((<any[]>results.unStateEntities).length).to.equal(EXPECTED_UNSTATE_QUANTITY);
      expect((<any[]>results.unStateLessEntities).length).to.equal(EXPECTED_UNSTATE_LESS_QUANTITY);
      expect((<any[]>results.allEntities).length).to.equal(EXPECTED_UNSTATE_QUANTITY + EXPECTED_NON_UNSTATE_QUANTITY + EXPECTED_UNSTATE_LESS_QUANTITY);

      done();
    });
  });
});
