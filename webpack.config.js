const path = require('path');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpackMerge = require("webpack-merge");

const modeConfig = env => require(`./build-utils/webpack.${env}`)(env);
const WEB = JSON.parse(process.env.WEB_ENV || '0');

module.exports = ({ mode, presets } = { mode: "production", presets: [] }) => {
  const basicConfig = {
    mode,
    target: "node",
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [ "source-map-loader" ],
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
      extensions: [ '.ts', '.js' ]
    }
    /*,
    plugins: [
        new CleanWebpackPlugin(['dist'])
    ]*/
  };

  const additionalConfig = {};

  if (WEB) {
    // additionalConfig.devtool = 'inline-source-map';
    additionalConfig.entry = './src/index-web.ts';
    additionalConfig.target = 'web';
    additionalConfig.output = {
      path: path.join(__dirname, 'dist'),
      filename: 'vizabi-ddfcsv-reader.js',
      libraryTarget: 'var',
      library: 'DDFCsvReader'
    };
  }

  return webpackMerge(basicConfig, modeConfig(mode), additionalConfig);
};
