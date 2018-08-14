import * as chai from 'chai';
import * as compact from 'lodash.compact';
import { QueryFeature, featureDetectors } from 'ddf-query-validator';

const expect = chai.expect;
const conceptsLookupStub = new Map();

conceptsLookupStub.set('country', {concept: 'country', concept_type: 'entity_set', domain: 'geo'});
conceptsLookupStub.set('geo', {concept: 'geo', concept_type: 'entity_domain', domain: ''});

describe('Query features', () => {
  it('when query is appropriate then WhereClauseBasedOnConjunction and ConjunctionPartFromWhereClauseCorrespondsToJoin should be detected', done => {
    const query = {
      from: 'datapoints',
      select: {
        key: [
          'country',
          'time'
        ],
        value: [
          'income_per_person_gdppercapita_ppp_inflation_adjusted',
          'life_expectancy_years',
          'population_total'
        ]
      },
      where: {
        $and: [
          {
            country: '$country'
          }
        ]
      },
      join: {
        $country: {
          key: 'country',
          where: {
            country: {$in: ['afg']}
          }
        }
      },
      order_by: [
        'time'
      ]
    };

    const relatedFeatures = compact(featureDetectors.map(detector => detector(query, conceptsLookupStub)));

    expect(relatedFeatures).to.includes(QueryFeature.WhereClauseBasedOnConjunction);
    expect(relatedFeatures).to.includes(QueryFeature.ConjunctionPartFromWhereClauseCorrespondsToJoin);

    done();
  });

  it('when where section does NOT contain $and clause WhereClauseBasedOnConjunction should NOT be detected', done => {
    const query = {
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
    };

    const relatedFeatures = compact(featureDetectors.map(detector => detector(query, conceptsLookupStub)));

    expect(relatedFeatures).to.not.includes(QueryFeature.WhereClauseBasedOnConjunction);

    done();
  });

  it('when query is NOT datapoint based then WhereClauseBasedOnConjunction and ConjunctionPartFromWhereClauseCorrespondsToJoin should NOT be detected', done => {
    const query = {
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

    const relatedFeatures = compact(featureDetectors.map(detector => detector(query, conceptsLookupStub)));

    expect(relatedFeatures).to.not.includes(QueryFeature.WhereClauseBasedOnConjunction);

    done();
  });
});
