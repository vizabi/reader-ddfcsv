"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const _ = require("lodash");
const expect = chai.expect;
exports.BASE_PATH = './test/fixtures/';
exports.GLOBALIS_PATH = 'systema_globalis';
exports.WS_TESTING_PATH = 'VS-work/dataset_name_1';
exports.BIG_PATH = 'ddf--gapminder--population.big';
exports.POP_WPP_PATH = 'population_wpp';
exports.STATIC_ASSETS = 'static-assets';
exports.EMPTY_TRANSLATIONS_PATH = 'empty-translations';
exports.BROKEN_DATAPACKAGE_PATH = 'ds_broken_datapackage';
exports.NOT_EXISTED_DATASET = 'unexisted_dataset';
exports.EXISTED_DATASET = 'VS-work/dataset_name_1';
exports.NOT_EXISTED_BRANCH = 'unexisted_branch';
exports.EXISTED_BRANCH = 'master';
exports.NOT_EXISTED_COMMIT = 'unexisted_commit';
exports.EXISTED_COMMIT = 'HEAD';
exports.fromClauseCouldnotBeEmpty = new RegExp(`'from' clause couldn't be empty`);
exports.fromClauseMustBeString = new RegExp(`'from' clause must be string only`);
exports.fromClauseValueMustBeAllowed = new RegExp(`'from' clause must be one of the list: `);
exports.selectClauseCouldnotBeEmpty = new RegExp(`'select' clause couldn't be empty`);
exports.selectClauseMustHaveStructure = new RegExp(`'select' clause must have next structure: { key: \\[...\\], value: \\[...\\] }`);
exports.selectKeyClauseMustHaveAtLeast2Items = new RegExp(`'select.key' clause for '[\\w\\.]*' queries must have at least 2 items`);
exports.selectKeyClauseContainsUnavailableItems = new RegExp(`'select.key' clause for '[\\w\\.]*' query contains unavailable item\\(s\\): failed_concept`);
exports.selectValueClauseMustHaveAtLeast1Item = new RegExp(`'select.value' clause for '[\\w\\.]*' queries must have at least 1 item`);
exports.selectValueClauseContainsUnavailableItems = new RegExp(`'select.value' clause for '[\\w\\.]*' query contains unavailable item\\(s\\): failed_measure`);
exports.selectValueClauseContainsUnavailableItems1 = new RegExp(`'select.value' clause for '[\\w\\.]*' query contains unavailable item\\(s\\): failed_concept, failed_concept2`);
exports.selectValueClauseContainsUnavailableItems2 = new RegExp(`'select.value' clause for '[\\w\\.]*' query contains unavailable item\\(s\\): failed_concept, failed_concept2, concept`);
exports.selectKeyClauseMustHaveOnly1Item = new RegExp(`'select.key' clause for '[\\w\\.]*' queries must have only 1 item`);
exports.selectKeyClauseMustHaveOnly2ItemsInSchemaQueries = new RegExp(`'select.key' clause for '[\\w\\*]*.schema' queries must have exactly 2 items: 'key', 'value'`);
exports.selectValueClauseMustHaveCertainStructure = new RegExp(`'select.value' clause for '[\\w\\.]*' queries should be array of strings or empty`);
exports.selectValueClauseMustHaveCertainStructureInSchemaQueries = new RegExp(`'select.value' clause for '[\\w\\*]*.schema' queries should be array of strings or empty`);
exports.joinClauseShouldnotBeInSchemaQueries = new RegExp(`'join' clause for '[\\w\\*]*.schema' queries shouldn't be present in query`);
exports.languageClauseShouldnotBeInSchemaQueries = new RegExp(`'language' clause for '\[\\w\\*\]*.schema' queries shouldn't be present in query`);
exports.languageClauseMustBeString = new RegExp(`'language' clause must be string only`);
exports.joinClauseMustBeObject = new RegExp(`'join' clause must be object only`);
exports.whereClauseMustBeObject = new RegExp(`'where' clause must be object only`);
exports.joinWhereClauseMustBeObject = new RegExp(`'join.\\$test.where' clause must be object only`);
exports.joinKeyClauseMustBeString = new RegExp(`'join.\\$test.key' clause must be string only`);
exports.orderByClauseMustHaveCertainStructure = new RegExp(`'order_by' clause must be string or array of strings \\|\\| objects only`);
exports.whereClauseHasUnknownOperator = new RegExp(`'where' clause has unknown operator\\(s\\) '\\$geo'\, replace it with allowed operators: `);
exports.joinWhereClauseHasUnknownOperator = new RegExp(`'join\.\\$test\.where' clause has unknown operator\\(s\\) '\\$geo'\, replace it with allowed operators: `);
exports.tooManyQueryDefinitionErrors = new RegExp(`Too many query definition errors \\[repo: .\\/test\\/fixtures\\/VS-work\\/dataset_name_1\\/master\\-HEAD\\]`);
exports.notExpectedError = 'This should never be called.';
exports.expectPromiseRejection = async (options) => {
    let actualErrors;
    const { promiseFunction, args, expectedErrors, type = 'structure' } = options;
    const expErrsStr = _.chain(expectedErrors)
        .map((item) => item.toString())
        .uniq()
        .value();
    if (expErrsStr.length < expectedErrors.length) {
        throw new Error(`Only unique errors should be checked: ${expectedErrors}`);
    }
    try {
        await promiseFunction(...args);
        throw new Error(exports.notExpectedError);
    }
    catch (error) {
        actualErrors = error.toString();
    }
    finally {
        if (type === 'definitions') {
            expect(actualErrors).to.match(exports.tooManyQueryDefinitionErrors);
        }
        expect(actualErrors).to.not.equal(exports.notExpectedError);
        expect(exports.getAmountOfErrors(actualErrors)).to.equals(expectedErrors.length);
        for (const expectedError of expectedErrors) {
            expect(actualErrors).to.match(expectedError);
        }
    }
};
exports.expectedConcepts = [{
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
    { concept: 'region', concept_type: 'entity_domain', name: null }];
exports.EXPECTS_EXACTLY_ONE_ERROR = 1;
exports.EXPECTS_EXACTLY_TWO_ERRORS = 2;
exports.EXPECTS_EXACTLY_THREE_ERRORS = 3;
exports.EXPECTS_EXACTLY_FOUR_ERRORS = 4;
exports.EXPECTS_EXACTLY_FIVE_ERRORS = 5;
exports.getAmountOfErrors = (error) => {
    return error.toString().split('\n*').length - 1;
};
exports.checkExpectations = (fn, done) => {
    return (errorUnderExpectation) => {
        try {
            fn(errorUnderExpectation);
        }
        catch (expectationError) {
            return done(expectationError);
        }
        return done();
    };
};
//# sourceMappingURL=common.js.map