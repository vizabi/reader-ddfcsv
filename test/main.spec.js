/* eslint-disable sort-imports */

import _ from 'lodash';
import test from 'ava';
import {BackendFileReader, DDFCSVReader, Ddf} from '../dist/bundle';

/* eslint-enable sort-imports */
/* eslint-enable no-magic-numbers */

test('Reader', t => {
  const ddfCsvReader = new DDFCSVReader('ddf1csv-i');

  t.true(!!ddfCsvReader);

  t.pass();
});

test.cb('DDF get index', t => {
  const EXPECTED_RECORDS_COUNT = 601;
  const backendFileReader = new BackendFileReader();
  const ddf = new Ddf('./fixtures/ddf-folder', backendFileReader);

  ddf.getIndex((indexErr, indexData) => {
    t.false(!!indexErr);

    t.true(_.isArray(indexData));
    t.is(indexData.length, EXPECTED_RECORDS_COUNT);

    t.pass();
    t.end();
  });
});

test.cb('DDF get entities', t => {
  const EXPECTED_RECORDS_COUNT = 574;
  const backendFileReader = new BackendFileReader();
  const ddf = new Ddf('./fixtures/ddf-folder', backendFileReader);
  const query = {
    select: ['geo', 'geo.name', 'geo.world_4region'],
    where: {'geo.is--country': true},
    grouping: {},
    orderBy: null
  };

  ddf.getIndex(indexErr => {
    t.false(!!indexErr);

    ddf.getConceptsAndEntities(query, (entitiesErr, entitiesData) => {
      t.false(!!entitiesErr);
      t.true(_.isArray(entitiesData));
      t.is(entitiesData.length, EXPECTED_RECORDS_COUNT);

      t.pass();
      t.end();
    });
  });
});

test.cb('DDF get data points', t => {
  const EXPECTED_RECORDS_COUNT = 15454;
  const backendFileReader = new BackendFileReader();
  const ddf = new Ddf('./fixtures/ddf-folder', backendFileReader);
  const query = {
    select: [
      'geo',
      'time',
      'income_per_person_gdppercapita_ppp_inflation_adjusted',
      'life_expectancy_years',
      'population_total'],
    where: {'geo.is--country': true, time: [['1800', '2015']]},
    grouping: {},
    orderBy: 'time'
  };

  ddf.getIndex(indexErr => {
    t.false(!!indexErr);

    ddf.getConceptsAndEntities(query, entitiesErr => {
      t.false(!!entitiesErr);

      ddf.getDataPoints(query, (dataPointsErr, dataPointsData) => {
        t.false(!!dataPointsErr);
        t.true(_.isArray(dataPointsData));
        t.is(dataPointsData.length, EXPECTED_RECORDS_COUNT);

        t.pass();
        t.end();
      });
    });
  });
});
