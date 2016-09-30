import test from 'ava';
import {_} from 'lodash';
import {Ddf, BackendFileReader} from '../dist/bundle';

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
        {concept_type: {$eq: 'entity_set'}}
      ]
    }
  };

  ddf.ddfRequest(request, (err, data) => {
    const EXPECTED_RECORDS_COUNT = 9;
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
