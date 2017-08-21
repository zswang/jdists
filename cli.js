#!/usr/bin/env node

'use strict';
var jdists = require('./');
var optimist = require('optimist');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var util = require('util');
var colors = require('colors');

var argv = optimist
  .usage('$0 input1.js [input2.js] -o output')

.alias('h', 'help')
  .describe('h', 'show this help message and exit.')
  .string('h')

.alias('o', 'output')
  .describe('o', 'output the file.')
  .string('o')

.alias('r', 'remove')
  .describe('r', 'remove the block.')
  .default('r', 'remove,test')
  .string('r')

.alias('t', 'trigger')
  .describe('t', 'trigger the block.')
  .default('t', 'release')
  .string('t')

.alias('C', 'notClean')
  .describe('C', 'not clean continuous line.')
  .default('C', false)
  .boolean('C')

.alias('config', 'c')
  .describe('c', 'path to config file.')
  .default('c', '.jdistsrc')
  .string('c')

.alias('eval', 'e')
  .describe('e', 'evaluate script')
  .string('e')

.alias('v', 'version')
  .describe('v', 'Print version number and exit.')

.wrap(80)
  .argv;

var contents = [];
if (argv.eval) {
  var oldFromString = argv.fromString;
  argv.fromString = true;
  var content = jdists.build(argv.eval, argv);
  contents.push(content);
  argv.fromString = oldFromString;
}

if (argv._.length < 1 && contents.length <= 0) {
  if (argv.version) {
    var json = require('./package.json');
    console.log(json.name + '@' + json.version);
    return;
  }

  console.log(
    String(function () {
      /*
Usage:

    #{j,yellow}#{dist,green}#{s,yellow} <input list> [options]

Options:

    #{-r, --remove,cyan}                 Remove block tag name list (default "remove,test")
    #{-o, --output,cyan}                 Output file (default STDOUT)
    #{-v, --version,cyan}                Output jdists version
    #{-t, --trigger,cyan}                Trigger name list (default "release")
    #{-c, --config,cyan}                 Path to config file (default ".jdistsrc")
      */
    })
    .replace(/[^]*\/\*!?\s*|\s*\*\/[^]*/g, '')
    .replace(/#\{(.*?),(\w+)\}/g, function (all, text, color) {
      return colors[color](text);
    })
  );
  return;
}

var filenames = [];
argv._.forEach(function (filename) {
  filenames.push(filename);
  if (argv.notClean === true) {
    argv.clean = false;
  }
  contents.push(jdists.build(filename, argv));
});

var content = contents.join('\n');
if (argv.output) {
  mkdirp.sync(path.dirname(argv.output));
  fs.writeFileSync(argv.output, content);
  console.log(colors.green(util.format('%j jdists output complete.', filenames)));
}
else {
  console.log(content);
}