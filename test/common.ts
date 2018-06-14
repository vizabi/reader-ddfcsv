export const GLOBALIS_PATH = './test/fixtures/systema_globalis';
export const BIG_PATH = './test/fixtures/ddf--gapminder--population.big';
export const POP_WPP_PATH = './test/fixtures/population_wpp';
export const STATIC_ASSETS = './test/fixtures/static-assets';

export const expectedError1 = `'from' clause couldn't be empty`;
export const expectedError2 = `'from' clause must be string only`;
export const expectedError3 = `'from' clause must be one of the list: `;

export const expectedError4 = `'select' clause couldn't be empty`;
export const expectedError5 = `'select' clause must have next structure: { key: [...], value: [...] }`;
export const expectedError6 = `'select.key' clause for 'datapoints' queries must have at least 2 items`;
export const expectedError7 = `'select.key' clause for 'datapoints' queries contains unavailable item(s): failed_concept [repo: ${GLOBALIS_PATH}/]`;
export const expectedError8 = `'select.value' clause for 'datapoints' queries must have at least 1 item`;
export const expectedError9 = `'select.value' clause for 'datapoints' queries contains unavailable item(s): failed_measure [repo: ${GLOBALIS_PATH}/]`;
export const expectedError10 = `'select.key' clause for 'entities' queries must have only 1 item`;
export const expectedError11 = `'select.key' clause for 'concepts' queries must have only 1 item`;
export const expectedError12 = `'select.value' clause for 'concepts' queries should be array of strings or empty`;
export const expectedError13 = `'select.value' clause for 'entities' queries should be array of strings or empty`;
export const expectedError14 = `'select.key' clause for 'concepts.schema' queries must have exactly 2 items: 'key', 'value'`;
export const expectedError15 = `'select.value' clause for 'concepts.schema' queries should be array of strings or empty`;
export const expectedError16 = `'join' clause for '*.schema' queries shouldn't be present in query`;
export const expectedError17 = `'language' clause for '*.schema' queries shouldn't be present in query`;

export const expectedError18 = `'language' clause must be string only`;
export const expectedError19 = `'join' clause must be object only`;
export const expectedError20 = `'where' clause must be object only`;
export const expectedError21 = `'order_by' clause must be string or array of strings || objects only`;

export const expectedError22 = `'where' clause has unknown operator(s) '$concept', replace it with allowed operators: `;

export const notExpectedError = 'this should never be called';

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
