var jdists = require('../.');
var assert = require('should');
var fs = require('fs');
var util = require('util');
var path = require('path');

/**
 * 清除 \r，为兼容 Windows 下的文本换行符 CRLF
 */
function cleanCRLF(text) {
  return String(text).replace(/\r\n?/g, '\n');
}

/**
 * coverage
 */

jdists.registerProcessor();
jdists.registerProcessor('none', 'function() { return ""; }');
jdists.build('test/fixtures/coverage.html', {
  config: 'test/test.jdistsrc',
  remove: 'remove,test,quoted'
});
jdists.createScope().getScope();

describe('fixtures', function () {
  var dirname = 'test/fixtures';
  var items = fs.readdirSync(dirname).filter(function (item) {
    return /\.input\.(\w+)$/.test(item);
  }).forEach(function (input) {
    var output = input.replace(/\.input\.(\w+)$/, '.output.$1');
    it(input, function () {
      if (/\.throw\./.test(input)) { // 出现异常
        (function () {
          jdists.build(path.join(dirname, input), {
            output: output
          });
        }).should.throw();
        return;
      }
      assert.equal(
        jdists.build(path.join(dirname, input), {
          output: path.join(dirname, output)
        }),
        cleanCRLF(fs.readFileSync(path.join(dirname, output)))
      );
    });
  });

});