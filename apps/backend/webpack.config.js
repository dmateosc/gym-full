'use strict';

// Standalone webpack config used ONLY for Vercel serverless builds.
// NestJS default build (nest build / tsc) is still used for local dev.
//
// Why webpack here: Vercel's nft bundler traces dependencies from
// apps/backend/, but in an npm workspace the packages are hoisted to
// the workspace root (two levels up) which is outside Vercel's project
// boundary. Bundling everything into one file sidesteps this entirely.

const path = require('path');
const webpack = require('webpack');

// workspace root is two levels above apps/backend/
const ROOT_MODULES = path.resolve(__dirname, '../../node_modules');

module.exports = {
  mode: 'production',
  entry: './src/main.vercel.ts',
  target: 'node',
  externals: [],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: { transpileOnly: true },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    // Alias the fallback subpath that @nestjs/mapped-types tries after
    // the primary 'class-transformer/cjs/storage' (which always succeeds).
    alias: {
      'class-transformer/storage': path.join(
        ROOT_MODULES,
        'class-transformer/cjs/storage.js',
      ),
    },
  },
  plugins: [
    // @nestjs/core optionally requires microservices and websockets modules.
    // These are not installed, and the require() is wrapped in try/catch at
    // runtime — but webpack resolves statically. Ignore them here.
    new webpack.IgnorePlugin({
      resourceRegExp: /^@nestjs\/(microservices|websockets)(\/.*)?$/,
    }),
  ],
  output: {
    filename: 'main.vercel.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  optimization: { minimize: false },
};
