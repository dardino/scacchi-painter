/* eslint-disable @typescript-eslint/no-var-requires */
/* jshint esversion: 9 */

const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");

module.exports = {
  module: {
    rules,
  },
  plugins: plugins.concat([
    new CopyWebpackPlugin({ patterns: [
      {
        from: path.resolve(__dirname, 'frontend'),
        to: path.resolve(__dirname, '.webpack/renderer/main_window')
      }
    ]})
  ]),
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  },
};
