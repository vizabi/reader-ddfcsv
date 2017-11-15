import * as chai from 'chai';
import * as _ from 'lodash';
import { BackendFileReader, Ddf } from '../src/index';

const GLOBALIS_PATH = './test/fixtures/systema_globalis';
const SANKEY_PATH = './test/fixtures/sankey';

const expect = chai.expect;

describe('when getting schema', () => {
  let backendFileReader;

  beforeEach((done) => {
    backendFileReader = new BackendFileReader();

    done();
  });

  describe('for concepts', () => {
    it('should response be expected', done => {
      const conceptsSchemaResult = require('./results/concepts.schema.json');
      const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
      const request = {
        select: {
          key: ["key", "value"],
          value: []
        },
        from: "concepts.schema"
      };

      ddf.ddfRequest(request, (err, data) => {
        expect(!!err).to.be.false;
        expect(_.isEqual(data, conceptsSchemaResult)).to.be.true;

        done();
      });
    });
  });

  describe('for entities', () => {
    it('should response be expected', done => {
      const entitiesSchemaResult = require('./results/entities.schema.json');
      const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
      const request = {
        select: {
          key: ["key", "value"],
          value: []
        },
        from: "entities.schema"
      };

      ddf.ddfRequest(request, (err, data) => {
        expect(!!err).to.be.false;
        expect(_.isEqual(data, entitiesSchemaResult)).to.be.true;

        done();
      });
    });
  });

  describe('for datapoints', () => {
    it('should response be expected for simple request', done => {
      const dataPointsSchemaResult = require('./results/datapoints.simple.schema.json');
      const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
      const request = {
        select: {
          key: ["key", "value"],
          value: []
        },
        from: "datapoints.schema"
      };

      ddf.ddfRequest(request, (err, data) => {
        expect(!!err).to.be.false;
        expect(_.isEqual(data, dataPointsSchemaResult)).to.be.true;

        done();
      });
    });

    it('should response be expected for SG', done => {
      const dataPointsSchemaResult = require('./results/datapoints.complex.schema.json');
      const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
      const request = {
        select: {
          key: ["key", "value"],
          value: ["min(value)", "max(value)"]
        },
        from: "datapoints.schema"
      };

      ddf.ddfRequest(request, (err, data) => {
        expect(!!err).to.be.false;
        expect(_.isEqual(data, dataPointsSchemaResult)).to.be.true;

        done();
      });
    });

    it('should response be expected for Sankey', done => {
      const dataPointsSchemaResult = require('./results/sankey-min-max.json');
      const ddf = new Ddf(SANKEY_PATH, backendFileReader);
      const request = {
        select: {
          key: ["key", "value"],
          value: ["min(value)", "max(value)"]
        },
        from: "datapoints.schema"
      };

      ddf.ddfRequest(request, (err, data) => {
        expect(!!err).to.be.false;
        expect(_.isEqual(data, dataPointsSchemaResult)).to.be.true;

        done();
      });
    });
  });

  describe('for general query', () => {
    it('should response be expected', done => {
      const generalSchemaResult = require('./results/general.schema.json');
      const ddf = new Ddf(GLOBALIS_PATH, backendFileReader);
      const request = {
        select: {
          key: ["key", "value"],
          value: []
        },
        from: "*.schema"
      };

      ddf.ddfRequest(request, (err, data) => {
        expect(!!err).to.be.false;
        expect(_.isEqual(data, generalSchemaResult)).to.be.true;

        done();
      });
    });
  });
});
