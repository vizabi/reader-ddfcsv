import * as chai from 'chai';
import { getDDFCsvReaderObject } from '../src/index';

const expect = chai.expect;

describe('verbosity feature', () => {
  it(`1`, async () => {
    const reader = getDDFCsvReaderObject();

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

    console.log(JSON.stringify(reader.getVerbosityData(), null, 2));
  });
});
