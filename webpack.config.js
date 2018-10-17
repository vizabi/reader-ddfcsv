const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = () => ({
    mode: 'production',
    entry: {
        'babel-polyfill': 'babel-polyfill',
        'vizabi-ddfcsv-reader': './lib/src/index-web.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'var',
        library: 'DDFCsvReader'
    },
    target: "web",
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules\/(?![ddf\-query\-validator])/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['es2015', 'stage-0'],
                        plugins: [require('babel-plugin-transform-object-rest-spread')],
                        babelrc: false
                    }
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist'])
    ]
});
