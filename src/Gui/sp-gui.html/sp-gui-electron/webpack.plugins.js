/* eslint-disable @typescript-eslint/no-var-requires */
/* jshint esversion: 9 */

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = [
  new ForkTsCheckerWebpackPlugin()
];
