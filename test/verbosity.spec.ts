import * as chai from 'chai';
import { LogManager, LogLevel, StorageLogger } from 'gapminder-log-manager';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;

describe('verbosity feature', () => {
  it(`1`, async () => {
    const logger = new LogManager('ddfcsv reader', LogLevel.ALL);
    const storageLogger = new StorageLogger();

    logger.addOutputTo(storageLogger);

    const reader = getDDFCsvReaderObject(null, logger);

    reader.init({});
    const query = {
      repositoryPath: `./test/fixtures/systema_globalis/master-HEAD`,
      select: {
        key: ['concept'],
        value: [
          'concept_type', 'name'
        ]
      },
      from: 'concepts',
      where: {},
      order_by: ['concept'],
      verbosity: true
    };

    const result = await reader.read(query);

    expect(result.length).to.greaterThan(0);

    console.log(JSON.stringify(storageLogger.getContent(), null, 2));
  });
});
