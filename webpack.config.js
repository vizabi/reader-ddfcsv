const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = () => ({
    mode: 'production',
    entry: {
        'vizabi-ddfcsv-reader': './src/index-web.ts'
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
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new CleanWebpackPlugin(['dist'])
    ]
});
