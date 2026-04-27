#!/usr/bin/env node
'use strict';

// Builds the Vercel serverless handler using webpack's Node.js API.
// Runs as `node build-vercel.js` — does not require webpack-cli.

const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.config.js');

webpack(config, (err, stats) => {
  if (err) {
    console.error('Webpack fatal error:', err);
    process.exit(1);
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error('Webpack build errors:');
    info.errors.forEach((e) => console.error(e.message || e));
    process.exit(1);
  }

  if (stats.hasWarnings()) {
    info.warnings.forEach((w) => console.warn(w.message || w));
  }

  console.log(
    stats.toString({ colors: true, chunks: false, modules: false }),
  );
  console.log('\n✅ Vercel bundle ready: dist/main.vercel.js');
});
