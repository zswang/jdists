(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');
  var util = require('util');

  var jdists = require('../jdists');

  var forceDirSync = jdists.forceDirSync;
  var getAttrs = jdists.getAttrs;
  var replaceFile = jdists.replaceFile;
  var loadFile = jdists.loadFile;
  var buildBlock = jdists.buildBlock;
  var md5 = jdists.md5;

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
        return cb(util.format('File %j exists.', dst));
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
  module.exports = function(content, attrs, dirname, options, tag, readBlock, buildFile, sourceFile) {
    var js = []; // 所有 js 文件内容
    var css = []; // 所有 css 文件内容

    // 解析静态资源
    content = String(content).replace(
      /<script((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>([^]*?)<\/script>/gi,
      function(all, attrText, content) {
        var copyResource = function(t) {
          if (!attrs.img || !attrs.js) { // 不需要复制
            return t;
          }
          return String(t).replace(/\/\*@\*\/\s*(?:'|")([^'"]+\.(png|jpg|gif|jpeg|svg))('|")/g,
            function(all, filename) {
              var img = path.join(attrs.img, filename); // img 文件
              if (options.output) { // 计算相对路径 dist
                var input = path.join(path.dirname(sourceFile), filename);
                var output = path.resolve(path.dirname(options.output), img); // 相对于输出路径
                /*<debug>*/
                // console.log('input: %j, output: %j', input, output);
                // return;
                /*</debug>*/

                forceDirSync(path.dirname(output)); // 确保路径存在
                copy(input, output, function(err) {
                  if (err) {
                    util.puts(err);
                  }
                });
              }

              return JSON.stringify(img);
            }
          );
        };
        var a = getAttrs('script', attrText, dirname);
        if (a.src) {
          if (/^(|undefined|text\/javascript|text\/ecmascript)$/i.test(a.type)) {
            loadFile(a['@filename'], options);
            js.push(copyResource(replaceFile(a['@filename'], options)));
            return '';
          }
        } else {
          if (/^(|undefined|text\/javascript|text\/ecmascript)$/i.test(a.type)) {
            js.push(copyResource(buildBlock(content, readBlock, true)));
            return '';
          }
        }
        return all;
      }
    ).replace( // 样式表需要保证顺序
      /<link((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>|<style((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>([^]*?)<\/style>/ig,
      function(all, attrText, attrText2, content2) {
        var currdir;
        var copyResource = function(t) {
          if (!attrs.img || !attrs.css) { // 不需要复制
            return t;
          }
          return String(t).replace(/\burl\s*\(\s*([^():]+\.(png|jpg|gif|jpeg|svg))\s*\)/g,
            function(all, filename) {

              var cssDir = path.dirname(attrs.css.replace(/\?.*$/, '')); // 相对于输出路径
              var img = path.join(attrs.img, path.basename(filename)); // img 文件
              var cssImg = path.relative(cssDir, img);
              if (options.output) { // 计算相对路径 dist
                var input = path.join(currdir, filename);
                var output = path.resolve(path.dirname(options.output), cssDir, cssImg); // 相对于输出路径

                forceDirSync(path.dirname(output)); // 确保路径存在
                copy(input, output, function(err) {
                  if (err) {
                    util.puts(err);
                  }
                });
              }

              return 'url(' + cssImg + ')';
            }
          );
        };
        var b;
        if (attrText) {
          b = getAttrs('link', attrText, dirname);
          if (b.href) {
            if (/^(|undefined|text\/css)$/i.test(b.type)) {
              currdir = path.dirname(b['@filename']);
              loadFile(b['@filename'], options);
              css.push(copyResource(replaceFile(b['@filename'], options)));
              return '';
            }
          }
        }
        if (content2) {
          b = getAttrs('style', attrText2, dirname);
          if (/^(|undefined|text\/css)$/i.test(b.type)) {
            currdir = dirname;
            css.push(copyResource(buildBlock(content2, readBlock, true)));
            return '';
          }
        }
        return all;
      }
    );

    var runConcat = function(type, items, dest) {
      if (!items.length) { // 未找到资源
        return;
      }

      var body = items.join('\n');
      if (dest) { // 导出文件
        dest = String(dest).replace(/\{\{(\w+)(?:,(\d+))?\}\}/g, function(all, key, len) {
          switch (key) { // 计算 md5 戳
            case 'md5':
              if (len) {
                return md5(body).substring(0, len);
              }
              return md5(body);
          }
          return all;
        });
        var output = dest.replace(/\?.*$/, '');
        if (options.output) { // 计算相对路径 dist
          output = path.resolve(path.dirname(options.output), output); // 相对于输出路径
          output = path.resolve(dirname, output); // 相对于当前路径

          forceDirSync(path.dirname(output)); // 确保路径存在
          fs.writeFileSync(output, body); // 没有指定输出文件，则不实际输出
        }

        if (type === 'js') {
          content += '\n<script src="' + dest + '"></script>\n';
        } else {
          content += '\n<link rel="stylesheet" type="text/css" href="' + dest + '">\n';
        }
      } else {
        if (type === 'js') {
          content += '\n<script>\n' + body + '</script>';
        } else {
          content += '\n<style>\n' + body + '</style>';
        }
      }
    };

    runConcat('js', js, attrs.js);
    runConcat('css', css, attrs.css);

    return content;
  };

})();