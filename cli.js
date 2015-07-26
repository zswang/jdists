#!/usr/bin/env node

'use strict';
var jdists = require('./');
var optimist = require('optimist');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var util = require('util');

var argv = optimist
  .usage('$0 input1.js [input2.js] -o output')

  .alias('o', 'output')
  .describe('o', 'output file.')
  .string('o')

  .alias('r', 'remove')
  .describe('r', 'remove block.')
  .default('r', 'debug,test')
  .string('r')

  .alias('t', 'trigger')
  .describe('t', 'trigger block.')
  .default('t', 'release')
  .string('t')

  .alias('clean', 'c')
  .describe('c', 'clean white space.')
  .boolean('c')

  .alias('v', 'version')
  .describe('v', 'Print version number and exit.')

  .wrap(80)
  .argv;

if (argv.version) {
  var json = require('../package.json');
  console.log(json.name + ' ' + json.version);
  return;
}

if (argv._.length < 1) {
  console.error('The input file is not specified.');
  return;
}

var contents = [];
var filenames = [];
argv._.forEach(function (filename) {
  filenames.push(filename);
  contents.push(JSON.stringify(jdists.build(fs.readFileSync(filename), argv), null, '  '));
});
var content = contents.join('\n');
if (argv.output) {
  mkdirp(path.dirname(argv.output));
  fs.writeFileSync(argv.output, content);
  console.log(util.format('%j jdists output complete.', filenames));
}
else {
  console.log(content);
}