import _ from 'lodash';
import test from 'ava';
import {BackendFileReader, Ddf} from '../dist/bundle';

/* eslint-disable camelcase */

test.cb('DDF get index', t => {
  const EXPECTED_RECORDS_COUNT = 71;
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
  const EXPECTED_CONCEPTS_RECORDS_COUNT = 44;
  const EXPECTED_ENTITIES_RECORDS_COUNT = 275;
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

    ddf.getConceptsAndEntities(query, (err, conceptsData, entitiesData) => {
      t.false(!!err);
      t.true(_.isArray(conceptsData));
      t.true(_.isArray(entitiesData));
      t.is(conceptsData.length, EXPECTED_CONCEPTS_RECORDS_COUNT);
      t.is(entitiesData.length, EXPECTED_ENTITIES_RECORDS_COUNT);

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

      ddf.getDataPoints(query, (err, dataPointsData) => {
        t.false(!!err);
        t.true(_.isArray(dataPointsData));
        t.is(dataPointsData.length, EXPECTED_RECORDS_COUNT);

        t.pass();
        t.end();
      });
    });
  });
});

test.cb('get all concepts and datapoints', t => {
  const backendFileReader = new BackendFileReader(false);
  const ddf = new Ddf('./fixtures/ddf-folder', backendFileReader);
  const expectedConceptCounts = 44;
  const expectedMeasureTotals = {
    population_total: 20117,
    income_per_person_gdppercapita_ppp_inflation_adjusted: 43639,
    life_expectancy_years: 43444
  };

  ddf.getIndex(indexErr => {
    t.false(!!indexErr);

    ddf.getConcepts((conceptsErr, conceptsData) => {
      t.false(!!conceptsErr);
      t.is(conceptsData.length, expectedConceptCounts);

      ddf.getAllDataPointsContent(
        (dataPointsFileErr, dataPointsData) => {
          t.false(!!dataPointsFileErr);
          t.is(expectedMeasureTotals[dataPointsData.measure], dataPointsData.content.length);
        },
        dataPointsAllErr => {
          t.false(!!dataPointsAllErr);

          t.pass();
          t.end();
        });
    });
  });
});
