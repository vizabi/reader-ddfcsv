export const BASE_PATH = './test/fixtures/';
export const GLOBALIS_PATH = 'systema_globalis';
export const WS_TESTING_PATH = 'VS-work/dataset_name_1';
export const BIG_PATH = 'ddf--gapminder--population.big';
export const POP_WPP_PATH = 'population_wpp';
export const STATIC_ASSETS = 'static-assets';
export const EMPTY_TRANSLATIONS_PATH = 'empty-translations';
export const BROKEN_DATAPACKAGE_PATH = 'ds_broken_datapackage';

export const NOT_EXISTED_DATASET = 'unexisted_dataset';
export const EXISTED_DATASET = 'VS-work/dataset_name_1';

export const NOT_EXISTED_BRANCH = 'unexisted_branch';
export const EXISTED_BRANCH = 'master';

export const NOT_EXISTED_COMMIT = 'unexisted_commit';
export const EXISTED_COMMIT = 'HEAD';

export const fromClauseCouldnotBeEmpty = new RegExp(`'from' clause couldn't be empty`);
export const fromClauseMustBeString = new RegExp(`'from' clause must be string only`);
export const fromClauseValueMustBeAllowed = new RegExp(`'from' clause must be one of the list: `);

export const selectClauseCouldnotBeEmpty = new RegExp(`'select' clause couldn't be empty`);
export const selectClauseMustHaveStructure = new RegExp(`'select' clause must have next structure: { key: \\[...\\], value: \\[...\\] }`);
export const selectKeyClauseMustHaveAtLeast2Items = new RegExp(`'select.key' clause for '[\\w\\.]*' queries must have at least 2 items`);
export const selectKeyClauseContainsUnavailableItems = new RegExp(`'select.key' clause for '[\\w\\.]*' query contains unavailable item\\(s\\): failed_concept`);
export const selectValueClauseMustHaveAtLeast1Item = new RegExp(`'select.value' clause for '[\\w\\.]*' queries must have at least 1 item`);
export const selectValueClauseContainsUnavailableItems = new RegExp(`'select.value' clause for '[\\w\\.]*' query contains unavailable item\\(s\\): failed_measure`);
export const selectValueClauseContainsUnavailableItems1 = new RegExp(`'select.value' clause for '[\\w\\.]*' query contains unavailable item\\(s\\): failed_concept, failed_concept2`);
export const selectValueClauseContainsUnavailableItems2 = new RegExp(`'select.value' clause for '[\\w\\.]*' query contains unavailable item\\(s\\): failed_concept, failed_concept2, concept`);
export const selectKeyClauseMustHaveOnly1Item = new RegExp(`'select.key' clause for '[\\w\\.]*' queries must have only 1 item`);
export const selectKeyClauseMustHaveOnly2ItemsInSchemaQueries = new RegExp(`'select.key' clause for '[\\w\\*]*.schema' queries must have exactly 2 items: 'key', 'value'`);
export const selectValueClauseMustHaveCertainStructure = new RegExp(`'select.value' clause for '[\\w\\.]*' queries should be array of strings or empty`);
export const selectValueClauseMustHaveCertainStructureInSchemaQueries = new RegExp(`'select.value' clause for '[\\w\\*]*.schema' queries should be array of strings or empty`);
export const joinClauseShouldnotBeInSchemaQueries = new RegExp(`'join' clause for '[\\w\\*]*.schema' queries shouldn't be present in query`);
export const languageClauseShouldnotBeInSchemaQueries = new RegExp(`'language' clause for '\[\\w\\*\]*.schema' queries shouldn't be present in query`);

export const languageClauseMustBeString = new RegExp(`'language' clause must be string only`);
export const joinClauseMustBeObject = new RegExp(`'join' clause must be object only`);
export const whereClauseMustBeObject = new RegExp(`'where' clause must be object only`);
export const joinWhereClauseMustBeObject = new RegExp(`'join.\\$test.where' clause must be object only`);
export const joinKeyClauseMustBeString = new RegExp(`'join.\\$test.key' clause must be string only`);
export const orderByClauseMustHaveCertainStructure = new RegExp(`'order_by' clause must be string or array of strings \\|\\| objects only`);

export const whereClauseHasUnknownOperator = new RegExp(`'where' clause has unknown operator\\(s\\) '\\$geo'\, replace it with allowed operators: `);
export const joinWhereClauseHasUnknownOperator = new RegExp(`'join\.\\$test\.where' clause has unknown operator\\(s\\) '\\$geo'\, replace it with allowed operators: `);

export const tooManyQueryDefinitionErrors = new RegExp(`Too many query definition errors \\[repo: systema_globalis\\]`);

export const notExpectedError = 'This should never be called.';
export const expectedConcepts = [ {
  concept: 'additional_column',
  concept_type: 'string',
  name: null
},
  { concept: 'anno', concept_type: 'time', name: null },
  { concept: 'company', concept_type: 'entity_domain', name: null },
  {
    concept: 'company_scale',
    concept_type: 'entity_set',
    name: null
  },
  { concept: 'country', concept_type: 'string', name: null },
  { concept: 'domain', concept_type: 'string', name: null },
  {
    concept: 'english_speaking',
    concept_type: 'entity_set',
    name: null
  },
  {
    concept: 'full_name_changed',
    concept_type: 'string',
    name: null
  },
  { concept: 'latitude', concept_type: 'measure', name: null },
  { concept: 'lines_of_code', concept_type: 'measure', name: null },
  { concept: 'longitude', concept_type: 'measure', name: null },
  { concept: 'meeting_style', concept_type: 'string', name: null },
  { concept: 'methodology', concept_type: 'string', name: null },
  { concept: 'name', concept_type: 'string', name: null },
  { concept: 'popular_appeal', concept_type: 'string', name: null },
  { concept: 'project', concept_type: 'entity_domain', name: null },
  { concept: 'region', concept_type: 'entity_domain', name: null } ];

export const EXPECTS_EXACTLY_ONE_ERROR = 1;
export const EXPECTS_EXACTLY_TWO_ERRORS = 2;
export const EXPECTS_EXACTLY_THREE_ERRORS = 3;
export const EXPECTS_EXACTLY_FOUR_ERRORS = 4;
export const EXPECTS_EXACTLY_FIVE_ERRORS = 5;

export const getAmountOfErrors = (error) => {
  return error.toString().split('\n*').length - 1;
};

export const checkExpectations = (fn: Function, done: Function) => {
  return (errorUnderExpectation) => {
    try {
      fn(errorUnderExpectation);
    } catch (expectationError) {
      return done(expectationError);
    }
    return done();
  };
};
