import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../src/index';
import {
  EndpointDiagnosticManager,
  createDiagnosticManagerOn,
  getLevelByLabel,
  Level
} from 'cross-project-diagnostics';

const expect = chai.expect;

describe('Cross-platform Diagnostics in ddfcsv reader', () => {
  describe('for concepts', () => {
    const query = {
      repositoryPath: './test/fixtures/systema_globalis/master-HEAD',
      select: {
        key: ['concept'],
        value: [
          'concept_type', 'name'
        ]
      },
      from: 'concepts',
      where: {},
      order_by: ['concept']
    };

    it('concepts query with ALL severity', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});
      const diagnostic: EndpointDiagnosticManager =
        createDiagnosticManagerOn(process.env.npm_package_name, process.env.npm_package_version)
          .forRequest('R01').withSeverityLevel(Level.ALL);
      const {debug} = diagnostic.prepareDiagnosticFor('it');

      debug('prepare reading', query);

      const result = await reader.read(query, null, diagnostic);

      diagnostic.putDiagnosticContentInto(result);

      expect(result._diagnostic.length).to.be.equal(19);
    });

    it('concepts query with OFF severity', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});
      const diagnostic: EndpointDiagnosticManager =
        createDiagnosticManagerOn(process.env.npm_package_name, process.env.npm_package_version)
          .forRequest('R01').withSeverityLevel(Level.OFF);
      const {debug} = diagnostic.prepareDiagnosticFor('it');

      debug('prepare reading', query);

      const result = await reader.read(query, null, diagnostic);

      diagnostic.putDiagnosticContentInto(result);

      expect(result._diagnostic.length).to.be.equal(0);
    });

    it('concepts query without DiagnosticManager', async () => {
      const reader = getDDFCsvReaderObject();
      reader.init({});

      const result = await reader.read(query, null);

      expect(!!result._diagnostic).to.be.false;
    });
  });
});
