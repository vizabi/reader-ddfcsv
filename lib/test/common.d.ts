export declare const BASE_PATH = "./test/fixtures/";
export declare const GLOBALIS_PATH = "systema_globalis";
export declare const WS_TESTING_PATH = "VS-work/dataset_name_1";
export declare const BIG_PATH = "ddf--gapminder--population.big";
export declare const POP_WPP_PATH = "population_wpp";
export declare const STATIC_ASSETS = "static-assets";
export declare const EMPTY_TRANSLATIONS_PATH = "empty-translations";
export declare const BROKEN_DATAPACKAGE_PATH = "ds_broken_datapackage";
export declare const NOT_EXISTED_DATASET = "unexisted_dataset";
export declare const EXISTED_DATASET = "VS-work/dataset_name_1";
export declare const NOT_EXISTED_BRANCH = "unexisted_branch";
export declare const EXISTED_BRANCH = "master";
export declare const NOT_EXISTED_COMMIT = "unexisted_commit";
export declare const EXISTED_COMMIT = "HEAD";
export declare const fromClauseCouldnotBeEmpty: RegExp;
export declare const fromClauseMustBeString: RegExp;
export declare const fromClauseValueMustBeAllowed: RegExp;
export declare const selectClauseCouldnotBeEmpty: RegExp;
export declare const selectClauseMustHaveStructure: RegExp;
export declare const selectKeyClauseMustHaveAtLeast2Items: RegExp;
export declare const selectKeyClauseContainsUnavailableItems: RegExp;
export declare const selectValueClauseMustHaveAtLeast1Item: RegExp;
export declare const selectValueClauseContainsUnavailableItems: RegExp;
export declare const selectValueClauseContainsUnavailableItems1: RegExp;
export declare const selectValueClauseContainsUnavailableItems2: RegExp;
export declare const selectKeyClauseMustHaveOnly1Item: RegExp;
export declare const selectKeyClauseMustHaveOnly2ItemsInSchemaQueries: RegExp;
export declare const selectValueClauseMustHaveCertainStructure: RegExp;
export declare const selectValueClauseMustHaveCertainStructureInSchemaQueries: RegExp;
export declare const joinClauseShouldnotBeInSchemaQueries: RegExp;
export declare const languageClauseShouldnotBeInSchemaQueries: RegExp;
export declare const languageClauseMustBeString: RegExp;
export declare const joinClauseMustBeObject: RegExp;
export declare const whereClauseMustBeObject: RegExp;
export declare const joinWhereClauseMustBeObject: RegExp;
export declare const joinKeyClauseMustBeString: RegExp;
export declare const orderByClauseMustHaveCertainStructure: RegExp;
export declare const whereClauseHasUnknownOperator: RegExp;
export declare const joinWhereClauseHasUnknownOperator: RegExp;
export declare const tooManyQueryDefinitionErrors: RegExp;
export declare const notExpectedError = "This should never be called.";
export declare const expectPromiseRejection: (options: {
    promiseFunction: any;
    args: any;
    expectedErrors: RegExp[];
}) => Promise<void>;
export declare const expectedConcepts: {
    concept: string;
    concept_type: string;
    name: any;
}[];
export declare const EXPECTS_EXACTLY_ONE_ERROR = 1;
export declare const EXPECTS_EXACTLY_TWO_ERRORS = 2;
export declare const EXPECTS_EXACTLY_THREE_ERRORS = 3;
export declare const EXPECTS_EXACTLY_FOUR_ERRORS = 4;
export declare const EXPECTS_EXACTLY_FIVE_ERRORS = 5;
export declare const getAmountOfErrors: (error: any) => number;
export declare const checkExpectations: (fn: Function, done: Function) => (errorUnderExpectation: any) => any;