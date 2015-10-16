var jdists = require('../.');
var assert = require('should');
var fs = require('fs');
var util = require('util');
var path = require('path');
var rimraf = require('rimraf');

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
jdists.registerProcessor('number', 1);
jdists.registerProcessor('none', 'function() { return ""; }');
jdists.build('test/fixtures/coverage.html', {
  config: 'test/test.jdistsrc',
  remove: 'remove,test,quoted'
});
jdists.build('test/fixtures/ttt.js');
jdists.build('test/fixtures/ttt.js', {
  config: 'noexists'
});
jdists.build('test/fixtures/ttt.js', {
  config: 'test/none.jdistsrc'
});
jdists.createScope().getScope();

describe('coverage', function () {
  it('hook', function () {
    assert.equal(
      jdists.build('/*<jdists import="#hook"></jdists>*/', {
        fromString: true
      }, function (scope) {
        scope.setVariant('hook', 'hello');
      }),
      'hello'
    );
  });

  it('fromString', function () {
    assert.equal(
      jdists.build('/*<jdists encoding="base64">hello</jdists>*/', {
        fromString: true
      }),
      new Buffer('hello').toString('base64')
    );
  });

  it('fromString empty', function () {
    assert.equal(
      jdists.build('', {
        fromString: true
      }),
      ''
    );
  });

  it('execExport sync', function () {
    jdists.build('/*<jdists encoding="base64" export="test/fixtures/a/b/h.txt">hello</jdists>*/', {
      fromString: true
    });
    assert.ok(fs.existsSync('test/fixtures/a/b/h.txt'));
    rimraf.sync('test/fixtures/a');
  });
});

fs.unlinkSync('test/fixtures/ccc.js');

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