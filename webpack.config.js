const webpack = require('webpack');
const path = require('path');

/* eslint-disable no-process-env */
const PROD = JSON.parse(process.env.PROD_ENV || '0');
const WEB = JSON.parse(process.env.WEB_ENV || '0');

const config = {
  entry: {'main-backend': './src/index.js'},
  target: 'node',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel']
      }
    ]
  },
  resolve: {extensions: ['', '.js']},
  profile: true,
  plugins: PROD ? [
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
    new webpack.IgnorePlugin(/vertx/)
  ] : [
    new webpack.IgnorePlugin(/vertx/)
  ]
};

if (WEB) {
  config.entry['main-backend'] = './src/index-web.js';
  config.target = 'web';
  config.output.filename = 'bundle.web.js';
  config.output.libraryTarget = 'var';
  config.output.library = 'DDFCsvReader';
}

module.exports = config;
