var jdists = require('../src/index.js');
var assert = require('should');
var fs = require('fs');
var util = require('util');
var path = require('path');

describe('fixtures', function() {
  var dirname = 'test/fixtures';
  var items = fs.readdirSync(dirname).filter(function(item) {
    return /\.input\.(js|html|css)$/.test(item);
  }).forEach(function(input) {
    var output = input.replace(/\.input\.(js|html|css)$/, '.output.$1');
    it(input, function() {
      if (/\.throw\./.test(input)) { // 出现异常
        (function() {
          jdists.build(path.join(dirname, input), {
            output: output
          });
        }).should.throw();
        return;
      }
      assert.equal(
        jdists.build(path.join(dirname, input)),
        String(fs.readFileSync(path.join(dirname, output)))
      );
    });
  });

});