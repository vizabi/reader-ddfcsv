import test from 'ava';
import {_} from 'lodash';
import {getDDFCsvReaderObject} from '../dist/bundle';

/* eslint-disable camelcase */

const GLOBALIS_PATH = './fixtures/systema_globalis';

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
        {concept_type: {$eq: 'entity_set'}}
      ]
    }
  };

  readerObject.init({path: GLOBALIS_PATH});

  const pro = readerObject.read(request);

  return pro.then(() => {
    const EXPECTED_RECORDS_COUNT = 9;
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
