import test from 'ava';
import {_} from 'lodash';
import {Ddf, BackendFileReader, getDDFCsvReaderObject} from '../dist/bundle';

/* eslint-disable camelcase */

const backendFileReader = new BackendFileReader();
const GLOBALIS_PATH = './fixtures/systema_globalis';

test.cb('concepts query', t => {
  const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
  const request = {
    select: {
      key: ['concept'],
      value: [
        'concept_type', 'name', 'unit', 'color'
      ]
    },
    from: 'concepts',
    where: {
      $and: [
        {concept_type: {$eq: 'entity_set'}},
        {'color.palette._default': {$exists: true}}
      ]
    }
  };

  ddf.processRequest(request, (err, data) => {
    const EXPECTED_RECORDS_COUNT = 2;
    const EXPECTED_FIELDS_COUNT = 5;

    t.false(!!err);
    t.is(data.length, EXPECTED_RECORDS_COUNT);

    const firstRecord = _.head(data);
    const keys = Object.keys(firstRecord);

    t.is(keys.length, EXPECTED_FIELDS_COUNT);

    keys.forEach(key => {
      t.true(_.includes(request.select.key, key) || _.includes(request.select.value, key));
    });

    t.pass();
    t.end();
  });
});

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

  ddf.processRequest(request, (err, data) => {
    const EXPECTED_RECORDS_COUNT = 275;

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
    select: {key: ['geo'], value: ['name', 'shape_lores_svg']},
    where: {'geo.is--world_4region': true},
    grouping: {},
    orderBy: null
  };

  ddf.processRequest(request, (err, data) => {
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

  ddf.processRequest(request, (err, data) => {
    const EXPECTED_RECORDS_COUNT = 84;

    t.false(!!err);
    t.is(data.length, EXPECTED_RECORDS_COUNT);

    t.pass();
    t.end();
  });
});

test.cb('datapoints query', t => {
  const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
  const request = {
    from: 'datapoints',
    animatable: 'time',
    select: {
      key: ['geo', 'time'],
      value: ['life_expectancy_years', 'income_per_person_gdppercapita_ppp_inflation_adjusted', 'population_total']
    },
    where: {
      'geo.is--country': true,
      time: {$gt: 1800, $lt: 2016}
    },
    grouping: {},
    orderBy: 'time'
  };

  ddf.processRequest(request, (err, data) => {
    const EXPECTED_RECORDS_COUNT = 47930;
    const EXPECTED_FIELDS_COUNT = 5;

    t.false(!!err);
    t.is(data.length, EXPECTED_RECORDS_COUNT);

    const firstRecord = _.head(data);
    const keys = Object.keys(firstRecord);

    t.is(keys.length, EXPECTED_FIELDS_COUNT);

    keys.forEach(key => {
      t.true(_.includes(request.select.key, key) || _.includes(request.select.value, key));
    });

    t.pass();
    t.end();
  });
});

test('read method', t => {
  const readerObject = getDDFCsvReaderObject();
  const request = {
    select: {
      key: ['concept'],
      value: [
        'concept_type', 'name', 'unit', 'color'
      ]
    },
    from: 'concepts',
    where: {
      $and: [
        {concept_type: {$eq: 'entity_set'}},
        {'color.palette._default': {$exists: true}}
      ]
    }
  };

  readerObject.init({path: GLOBALIS_PATH});

  const pro = readerObject.read(request);

  return pro.then(() => {
    const EXPECTED_RECORDS_COUNT = 2;
    const EXPECTED_FIELDS_COUNT = 5;
    const data = readerObject.getData();

    t.is(data.length, EXPECTED_RECORDS_COUNT);

    const firstRecord = _.head(data);
    const keys = Object.keys(firstRecord);

    t.is(keys.length, EXPECTED_FIELDS_COUNT);

    keys.forEach(key => {
      t.true(_.includes(request.select.key, key) || _.includes(request.select.value, key));
    });
  });
});
