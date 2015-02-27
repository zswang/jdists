(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');
  var util = require('util');

  var common = require('../common');
  var forceDirSync = common.forceDirSync;

  var getAttrs = common.getAttrs;
  var attrs2text = common.attrs2text;

  var copyCache = {}; // 已经复制过的内容

  var copy = function(src, dst, cb) {
    if (copyCache[[src, dst]] || src === dst) {
      cb(null);
      return;
    }
    copyCache[[src, dst]] = true;
    /*<debug>*/
    // console.log('src: %j, dst: %j', src, dst);
    /*</debug>*/

    function copy(err) {
      if (!err) {
        console.warn('File "%s" overwrite.', dst);
      }

      fs.stat(src, function(err) {
        if (err) {
          return cb(err);
        }
        var is = fs.createReadStream(src);
        var os = fs.createWriteStream(dst);
        is.pipe(os, cb);
      });
    }

    fs.stat(dst, copy);
  };

  /**
   * 资源合并处理器
   */
  module.exports = function(e) {
    var content = e.content;
    var dirname = e.dirname;
    var filename = e.filename;
    var attrs = e.attrs;
    var options = e.options;

    var js = []; // 所有 js 文件内容
    var css = []; // 所有 css 文件内容
    // 解析静态资源
    content = String(content).replace(
      /<script((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>([^]*?)<\/script>/gi,
      function(all, attrText, content) {
        var a = getAttrs('script', attrText, dirname);
        if (a.src) {
          if (/^(|undefined|text\/javascript|text\/ecmascript)$/i.test(a.type)) {
            a.src = path.relative(path.dirname(filename), path.join(dirname, a.src));

            return '<script ' + attrs2text(a) + '>' + content + '</script>';
          }
        }
        return all;
      }
    ).replace( // 样式表需要保证顺序
      /<link((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>/ig,
      function(all, attrText) {
        var b = getAttrs('link', attrText, dirname);
        if (b.href) {
          if (/^(|undefined|text\/css)$/i.test(b.type)) {
            b.href = path.relative(path.dirname(filename), path.join(dirname, b.href));
            return '<link ' + attrs2text(b) + '>';
          }
        }
        return all;
      }
    ).replace(
      /<img((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?\/?>/ig,
      function(all, attrText, content) {
        var a = getAttrs('src', attrText, dirname);
        var img = '';
        if (a.src) {
          img = path.relative(path.dirname(filename), path.join(dirname, a.src));

          if (attrs.img && options.output) { // 计算相对路径 dist
            var input = path.join(path.dirname(filename), img);
            var output = path.resolve(path.dirname(options.output), attrs.img, img); // 相对于输出路径

            img = path.relative(path.dirname(filename), output);
            /*<debug>
            console.log('input: %j, output: %j', input, output);
            return;
            //</debug>*/

            forceDirSync(path.dirname(output)); // 确保路径存在
            copy(input, output, function(err) {
              if (err) {
                util.puts(err);
              }
            });
          }

          a.src = img;

          return '<img ' + attrs2text(a) + '>';
        }
        return all;
      }
    );
    return content;
  };

})();