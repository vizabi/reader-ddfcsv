const path = require('path');

module.exports = (env) => ({
    entry: {
        'vizabi-ddfcsv-reader-node': './src/index.ts',
        'test-cases-concepts': './test/definition/test-cases/concepts.ts',
        'test-cases-entities': './test/definition/test-cases/entities.ts'
    },
    output: {
        path: path.join(__dirname, '../dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs'
    }
});
