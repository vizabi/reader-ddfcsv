import {
  BASE_PATH,
  EXISTED_BRANCH,
  EXISTED_COMMIT,
  EXISTED_DATASET,
  NOT_EXISTED_BRANCH, NOT_EXISTED_COMMIT,
  NOT_EXISTED_DATASET
} from '../common';
import { getDDFCsvReaderObject } from '../../src';
import * as chai from 'chai';
import cloneDeep = require('lodash/cloneDeep');

const expect = chai.expect;

const query = {
  language: 'ru-ru',
  select: {
    key: [ 'project' ],
    value: [ 'name' ]
  },
  from: 'entities'
};

const IS_DEFAULT_STATE = true;
const IS_EXISTED_STATE = true;

const DATASET_STATES = [
  [ IS_DEFAULT_STATE, !IS_EXISTED_STATE ],
  [ IS_DEFAULT_STATE, IS_EXISTED_STATE ],
  [ !IS_DEFAULT_STATE, !IS_EXISTED_STATE ],
  [ !IS_DEFAULT_STATE, IS_EXISTED_STATE ]
];

const BRANCH_STATES = [
  [ IS_DEFAULT_STATE, !IS_EXISTED_STATE ],
  [ IS_DEFAULT_STATE, IS_EXISTED_STATE ],
  [ !IS_DEFAULT_STATE, !IS_EXISTED_STATE ],
  [ !IS_DEFAULT_STATE, IS_EXISTED_STATE ]
];

const COMMIT_STATES = [
  [ IS_DEFAULT_STATE, !IS_EXISTED_STATE ],
  [ IS_DEFAULT_STATE, IS_EXISTED_STATE ],
  [ !IS_DEFAULT_STATE, !IS_EXISTED_STATE ],
  [ !IS_DEFAULT_STATE, IS_EXISTED_STATE ]
];

describe('Availability of dataset&branch&commit', () => {
  DATASET_STATES.forEach(dataset => {
    const [ IS_DEFAULT_DATASET, IS_EXISTED_DATASET ] = dataset;
    const EXPECTED_DATASET = IS_EXISTED_DATASET ? EXISTED_DATASET : NOT_EXISTED_DATASET;

    BRANCH_STATES.forEach(branches => {
      const [ IS_DEFAULT_BRANCH, IS_EXISTED_BRANCH ] = branches;
      const EXPECTED_BRANCH = IS_EXISTED_BRANCH ? EXISTED_BRANCH : NOT_EXISTED_BRANCH;

      describe(`Check ${EXPECTED_DATASET}/${EXPECTED_BRANCH}`, () => {
        let OLD_DEFAULT_DATASET_NAME;
        let OLD_DEFAULT_BRANCH_NAME;
        let OLD_DEFAULT_COMMIT_NAME;

        beforeEach(() => {
          OLD_DEFAULT_DATASET_NAME = process.env.DEFAULT_DATASET_NAME;
          OLD_DEFAULT_BRANCH_NAME = process.env.DEFAULT_BRANCH_NAME;
          OLD_DEFAULT_COMMIT_NAME = process.env.DEFAULT_COMMIT_NAME;
        });

        afterEach(() => {
          process.env.DEFAULT_DATASET_NAME = OLD_DEFAULT_DATASET_NAME;
          process.env.DEFAULT_BRANCH_NAME = OLD_DEFAULT_BRANCH_NAME;
          process.env.DEFAULT_COMMIT_NAME = OLD_DEFAULT_COMMIT_NAME;
        });

        COMMIT_STATES.forEach(commits => {
          const [ IS_DEFAULT_COMMIT, IS_EXISTED_COMMIT ] = commits;
          const EXPECTED_COMMIT = IS_EXISTED_COMMIT ? EXISTED_COMMIT : NOT_EXISTED_COMMIT;

          it(`for commit ${EXPECTED_COMMIT}`, async function () {
            const reader = getDDFCsvReaderObject();
            const subquery: { dataset?: string, branch?: string, commit?: string } = {};
            const defaultQuery: any = cloneDeep(query);

            if (IS_DEFAULT_DATASET) {
              process.env.DEFAULT_DATASET_NAME = EXPECTED_DATASET;
            }

            if (!IS_DEFAULT_DATASET) {
              process.env.DEFAULT_DATASET_NAME = '';
              subquery.dataset = EXPECTED_DATASET;
            }

            if (IS_DEFAULT_BRANCH) {
              process.env.DEFAULT_DATASET_BRANCH = EXPECTED_BRANCH;
            }

            if (!IS_DEFAULT_BRANCH) {
              process.env.DEFAULT_BRANCH_NAME = '';
              subquery.branch = EXPECTED_BRANCH;
            }

            if (IS_DEFAULT_COMMIT) {
              process.env.DEFAULT_DATASET_COMMIT = EXPECTED_COMMIT;
            }

            if (!IS_DEFAULT_COMMIT) {
              process.env.DEFAULT_DATASET_COMMIT = '';
              subquery.commit = EXPECTED_COMMIT;
            }

            let data;
            const fullQuery = Object.assign(subquery, defaultQuery);

            try {
              await reader.init({ path: BASE_PATH });
              data = await reader.read(fullQuery);
            } catch (error) {
              if (IS_DEFAULT_DATASET) {
                expect(error.details).to.contains('Default dataset ' + EXPECTED_DATASET);
              } else {
                expect(error.details).to.not.contains('Default dataset ' + EXPECTED_DATASET);
                expect(error.details).to.contains('dataset ' + EXPECTED_DATASET);
              }

              if (!IS_EXISTED_DATASET) {
                expect(error.details).to.contains(EXPECTED_DATASET);
                expect(error.details).to.not.contains(EXPECTED_BRANCH);
                expect(error.details).to.not.contains(EXPECTED_COMMIT);
                return;
              }

              if (IS_DEFAULT_BRANCH) {
                expect(error.details).to.contains('Default branch ' + EXPECTED_BRANCH);
              } else {
                expect(error.details).to.not.contains('Default branch ' + EXPECTED_BRANCH);
                expect(error.details).to.contains('branch ' + EXPECTED_BRANCH);
              }

              if (!IS_EXISTED_BRANCH) {
                expect(error.details).to.contains(EXPECTED_DATASET);
                expect(error.details).to.contains(EXPECTED_BRANCH);
                expect(error.details).to.not.contains(EXPECTED_COMMIT);
                return;
              }

              if (IS_DEFAULT_COMMIT) {
                expect(error.details).to.contains('Default commit ' + EXPECTED_COMMIT);
              } else {
                expect(error.details).to.not.contains('Default commit ');
                expect(error.details).to.contains('commit ' + EXPECTED_COMMIT);
              }

              if (!IS_EXISTED_COMMIT) {
                expect(error.details).to.contain.all.keys(EXPECTED_DATASET, EXPECTED_BRANCH, EXPECTED_COMMIT);
              }
              throw error;
              return;
            }

            expect(data).to.not.null;
            expect(fullQuery.dataset).to.equal(EXPECTED_DATASET);
            expect(fullQuery.branch).to.equal(EXPECTED_BRANCH);
            expect(fullQuery.commit).to.equal(EXPECTED_COMMIT);
          });
        });
      });
    });
  });
});
