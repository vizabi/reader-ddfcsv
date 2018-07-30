const path = require('path');

module.exports = (env) => ({
    entry: './src/index.ts',
    output: {
        path: path.join(__dirname, '../dist'),
        filename: 'vizabi-ddfcsv-reader-node.js',
        libraryTarget: 'commonjs'
    }
});