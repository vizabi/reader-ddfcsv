import test from 'ava';
import {Ddf, BackendFileReader} from '../dist/bundle';

/* eslint-disable camelcase */

const backendFileReader = new BackendFileReader();
const GLOBALIS_PATH = './fixtures/systema_globalis';

test.cb('entities query', t => {
  const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
  const request = {
    from: 'entities',
    animatable: 'time',
    select: {
      key: ['geo'],
      value: ['geo.name', '_default', 'geo.world_4region']
    },
    where: {'geo.is--country': true},
    grouping: {},
    orderBy: null
  };

  ddf.ddfRequest(request, (err, data) => {
    const EXPECTED_RECORDS_COUNT = 275;

    t.false(!!err);
    t.is(data.length, EXPECTED_RECORDS_COUNT);

    data.forEach(record => {
      t.is(record.geo, record.country);
    });

    t.pass();
    t.end();
  });
});

test.cb('shapes query', t => {
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

    t.false(!!err);
    t.is(data.length, EXPECTED_RECORDS_COUNT);

    t.pass();
    t.end();
  });
});

test.cb('shapes query', t => {
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

    t.false(!!err);
    t.is(data.length, EXPECTED_RECORDS_COUNT);

    t.pass();
    t.end();
  });
});

test.cb('entities schema query', t => {
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
    const EXPECTED_RECORDS_COUNT = 3;

    t.false(!!err);
    t.is(data.length, EXPECTED_RECORDS_COUNT);

    t.pass();
    t.end();
  });
});
