const webpack = require('webpack');
const path = require('path');

/* eslint-disable no-process-env */
const PROD = JSON.parse(process.env.PROD_ENV || '0');

module.exports = {
  entry: {'main-backend': './src/index.js'},
  target: 'node',
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
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}})
  ] : []
};
