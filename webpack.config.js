const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = () => ([{
    mode: 'production',
    entry: {
        'reader-ddfcsv-polyfill': ['babel-polyfill', './lib-web/src/index-web.js']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'DDFCsvReader'
    },
    target: "web",
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
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
        new CleanWebpackPlugin(['dist'])// ,
        // new BundleAnalyzerPlugin()
    ]
},
{
    mode: 'production',
    entry: {
        'reader-ddfcsv': ['./lib-web/src/index-web.js'],
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'DDFCsvReader'
    },
    target: "web",
    devtool: 'source-map',
    plugins: [
        // new BundleAnalyzerPlugin()
    ]
}]);
