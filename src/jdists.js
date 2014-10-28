void

function() {

  'use strict';

  /**
   * jdists
   * 代码区域处理的工具
   * @author 王集鹄(wangjihu,http://weibo.com/zswang)
   * @version 2014-10-16
   */

  var fs = require('fs');
  var path = require('path');

  var chain; // 引用链

  var blocks; // key: filename, value: blocks

  var crypto = require('crypto');

  /*
   * 保证目录存在
   * @param{String} dir 目录
   */
  function forceDirSync(dir) {
    if (!fs.existsSync(dir)) {
      forceDirSync(path.dirname(dir));
      fs.mkdirSync(dir);
    }
  }

  /**
   * 计算 md5
   * @param{String} content 内容
   * @return 返回内容的 md5 值，以十六进制小写输出
   */
  function md5(content) {
    var hash = crypto.createHash('md5');
    hash.update(content);
    return hash.digest('hex');
  }

  var htmlDecodeDict = {
    'quot': '"',
    'lt': '<',
    'gt': '>',
    'amp': '&',
    'nbsp': ' '
  };

  /**
   * HTML解码
   * @param {String} html
   */
  function decodeHTML(html) {
    return String(html).replace(
      /&((quot|lt|gt|amp|nbsp)|#x([a-f\d]+)|#(\d+));/ig,
      function(all, group, key, hex, dec) {
        return key ? htmlDecodeDict[key.toLowerCase()] :
          hex ? String.fromCharCode(parseInt(hex, 16)) :
          String.fromCharCode(+dec);
      }
    );
  }

  var htmlEncodeDict = {
    '"': 'quot',
    '<': 'lt',
    '>': 'gt',
    '&': 'amp',
    ' ': 'nbsp'
  };

  /**
   * HTML编码
   * @param {String} text 文本
   */
  function encodeHTML(text) {
    return String(text).replace(/["<>& ]/g, function(all) {
      return '&' + htmlEncodeDict[all] + ';';
    });
  }

  /**
   * 获取属性对象
   * @param{String} tag 标签
   * @param{String} attrText 属性文本
   * @param{String} dirname 文件目录名
   * @return 返回属性对象，如果出现文件则计算绝对路径
   */
  var getAttrs = function(tag, attrText, dirname) {
    var result = {};
    if (/^(\s+[\w\/\\\-\.]+)*$/.test(attrText)) { // a b c
      var index = 0;
      attrText.replace(/[\w\/\\\-\.]+/g, function(value) {
        value = decodeHTML(value);
        result[index] = value;
        var key;
        if (/^(replace|include)$/.test(tag)) {
          key = ['file', 'block', 'encoding', 'trigger'][index];
        } else if (tag === 'remove') {
          key = ['trigger'][index];
        } else {
          key = ['type', 'trigger'][index];
        }
        if (key) {
          result[key] = value;
        }
        index++;
        return '';
      });
    } else { // a="v1" b="v2" c="v3"
      attrText.replace(/\s*([\w-_.]+)\s*=\s*"([^"]+)"/g, function(all, key, value) {
        result[key] = decodeHTML(value);
        return '';
      });
    }
    if (result.trigger) {
      result.trigger = result.trigger.split(',');
    }

    if (/^(\*|&)$/.test(result.file)) { // file="&" 当前文件
      result.file = '';
    }
    if (result.file) {
      result['@filename'] = path.resolve(dirname, result.file); // 计算绝对路径
    }
    if (tag === 'script' && result.src &&
      /^[^:]+$/.test(result.src)) {
      result['@filename'] = path.resolve(dirname, result.src); // 计算绝对路径
    }
    if (tag === 'link' && result.href &&
      /^[^:]+$/.test(result.href)) {
      result['@filename'] = path.resolve(dirname, result.href); // 计算绝对路径
    }
    return result;
  };

  /**
   * 资源合并处理器
   */
  var processorConcat = function(content, attrs, dirname, options, tag, readBlock) {
    var js = []; // 所有 js 文件内容
    var css = []; // 所有 css 文件内容

    // 解析静态资源
    content = String(content).replace(
      /<script((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>([^]*?)<\/script>/gi,
      function(all, attrText, content) {
        var attrs = getAttrs('script', attrText, dirname);
        if (attrs.src) {
          if (/^(|undefined|text\/javascript|text\/ecmascript)$/i.test(attrs.type)) {
            loadFile(attrs['@filename'], options);
            js.push(replaceFile(attrs['@filename'], options));
            return '';
          }
        } else {
          if (/^(|undefined|text\/javascript|text\/ecmascript)$/i.test(attrs.type)) {
            js.push(buildBlock(content, readBlock, true));
            return '';
          }
        }
        return all;
      }
    ).replace( // 样式表需要保证顺序
      /<link((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>|<style((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>([^]*?)<\/style>/ig,
      function(all, attrText, attrText2, content2) {
        var attrs;
        if (attrText) {
          attrs = getAttrs('link', attrText, dirname);
          if (attrs.href) {
            if (/^(|undefined|text\/css)$/i.test(attrs.type)) {
              loadFile(attrs['@filename'], options);
              css.push(replaceFile(attrs['@filename'], options));
              return '';
            }
          }
        }
        if (content2) {
          attrs = getAttrs('style', attrText2, dirname);
          if (/^(|undefined|text\/css)$/i.test(attrs.type)) {
            css.push(buildBlock(content2, readBlock, true));
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
        dest = String(dest).replace(/\{\{(\w+)\}\}/g, function(all, key) {
          switch (key) { // 计算 md5 戳
            case 'md5':
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

  /**
   * 内联资源处理器
   */
  var processorInline = function(content, attrs, dirname, options, tag) {
    /* TODO */
  };

  /**
   * 编码处理器集合
   * function(content, attrs, dirname, options, tag, readBlock)
   */
  var processors = {
    base64: function(content) {
      return (new Buffer(content)).toString('base64');
    },
    md5: function(content) {
      return md5(content);
    },
    url: function(content) {
      return encodeURIComponent(content);
    },
    html: function(content) {
      return encodeHTML(content);
    },
    string: function(content) {
      return JSON.stringify(content);
    },
    concat: processorConcat,
    inline: processorInline
  };

  /**
   * 编译块
   * @param{String} content 内容
   * @param{Function} onread 读取函数
   * @param{Boolean} isReplace 是否替换过程
   * @return 返回编译后的内容
   */
  var buildBlock = function(content, onread, isReplace) {

    // var read = function() {
    //   var args = ;
    //   return onread.call(block, arguments);
    // };
    content = String(content).replace(
      /<!--(include)((?:\s+[\w\/\\\-\.]+)*)\s*\/?-->/g,
      onread
    ).replace(
      /<!--(include)((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?-->/g,
      onread
    ).replace(
      /<!--([\w-_]+)((?:\s+[\w\/\\\-\.]+)*)\s*-->([^]*?)<!--\/\1-->/g,
      onread
    ).replace(
      /<!--([\w-_.]+)((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*-->([^]*?)<!--\/\1-->/g,
      onread
    ).replace(
      /\/\*<(include)((?:\s+[\w\/\\\-\.]+)*)\s*\/?>\*\//g,
      onread
    ).replace(
      /\/\*<(include)((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*\/?>\*\//g,
      onread
    ).replace(
      /\/\*<([\w-_]+)((?:\s+[\w\/\\\-\.]+)*)\s*>\*\/([^]*?)\/\*<\/\1>\*\//g,
      onread
    ).replace(
      /\/\*<([\w-_.]+)((?:\s*[\w-_.]+\s*=\s*"[^"]+")*)\s*>\*\/([^]*?)\/\*<\/\1>\*\//g,
      onread
    ).replace(
      /<!--([\w-_]+)((?:[ \f\t\v]+[\w\/\\\-\.]+)*)$([^]*?)^[ \f\t\v]*\/\1-->/gm,
      onread
    ).replace(
      /\/\*<([\w-_]+)((?:[ \f\t\v]+[\w\/\\\-\.]+)*)$([^]*?)^[ \f\t\v]*\/\1>\*\//gm,
      onread
    ).replace(
      /<!--([\w-_]+)((?:[ \f\t\v]*[\w-_.]+[ \f\t\v]*=[ \f\t\v]*"[^"]+")*)$([^]*?)^[ \f\t\v]*\/\1-->/gm,
      onread
    ).replace(
      /\/\*<([\w-_]+)((?:[ \f\t\v]*[\w-_.]+[ \f\t\v]*=[ \f\t\v]*"[^"]+")*)$([^]*?)^[ \f\t\v]*\/\1>\*\//gm,
      onread
    );

    if (isReplace) {
      content = content.replace(
        /function\s*\(\s*\)\s*\{\s*\/\*\!?([\s\S]*?)\*\/[\s;]*\}/g, // 处理函数注释字符串
        function(all, text) {
          return JSON.stringify(text);
        }
      );
    }

    return content;
  };

  /**
   * 加载文件
   * @param{String} filename 文件名，绝对路径
   * @param{Object} options 配置项
   */
  var loadFile = function(filename, options) {
    if (blocks[[filename, '']]) { // 文件已经处理过
      return;
    }
    /*<debug>*/
    // console.log('loadFile(filename: %j)', filename);
    /*</debug>*/
    blocks[[filename, '']] = {
      filename: filename,
      isFile: true
    };
    if (!fs.existsSync(filename)) {
      return;
    }

    options = options || {};

    if (/\.(png|jpeg|jpg|mp3|ogg|gif|eot|ttf|woff)$/.test(filename) ||
      (options.isBinary && options.isBinary(filename))) { // 已知二进制文件
      blocks[[filename, '']].isBinary = true;
      return;
    }

    var dirname = path.dirname(filename);

    var readBlock = function(all, tag, attrText, content, pos) {
      var attrs = getAttrs(tag, attrText, dirname);

      if (attrs.trigger &&
        attrs.trigger.indexOf(options.trigger) < 0) {
        return all;
      }

      var key = [filename, tag];
      /*<debug>*/
      // console.log('loadFile()::readBlock() key: %j', key);
      /*</debug>*/

      blocks[key] = blocks[[filename, tag]] || {
        filename: filename,
        tag: tag,
        nodes: []
      };

      blocks[key].nodes.push({
        pos: pos,
        attrs: attrs,
        content: content
      });

      if (attrs.file && /^(replace|include)$/.test(tag)) { // 需要引入文件
        loadFile(attrs['@filename'], options);
      }

      buildBlock(content, readBlock); // 处理嵌套
      return new Array(all.length + 1).join(' ');
    };

    blocks[[filename, '']].content = fs.readFileSync(filename);

    return buildBlock(blocks[[filename, '']].content, readBlock);
  };

  /**
   * 替换文件内容
   * @param{String} filename 文件名，绝对路径
   * @param{Object} options 配置项
   * @return 返回替换后的内容
   */
  var replaceFile = function(filename, options) {

    if (!blocks[[filename, '']]) {
      return '';
    }

    var dirname = path.dirname(filename);

    var readBlock = function(all, tag, attrText, content) {
      if (options.removeList.indexOf(tag) >= 0) {
        return '';
      }

      var attrs = getAttrs(tag, attrText, dirname);

      if (attrs.trigger &&
        attrs.trigger.indexOf(options.trigger) < 0) {
        return all;
      }

      switch (tag) {
        case 'replace':
        case 'include':
          if (attrs.block || attrs.file) {
            var blockfile = attrs['@filename'] || filename; // 默认当前文件名
            var blockname = attrs.block || ''; // 默认全部文件

            var key = [blockfile, blockname].join();
            var block = blocks[key];

            if (!block) { // 没有发现预加载的块
              return '';
            }


            if (!block.completed) {
              if (chain.indexOf(key) >= 0) { // 出现循环引用
                throw new Error('Circular reference block.');
              }
              chain.push(key);

              if (block.isFile) {
                if (block.isBinary) { // 二进制文件
                  block.content = fs.readFileSync(block.filename);
                } else {
                  block.content = replaceFile(block.filename, options);
                }
              } else {
                block.nodes.sort(function(a, b) { // 保证代码顺序
                  return a.pos - b.pos;
                });
                block.content = block.nodes.map(function(node) {
                  if (!node.completed) {
                    node.content = buildBlock(node.content, readBlock, true);
                    if (node.attrs.type === 'comment') {
                      if (/^\s*</.test(node.content)) {
                        node.content = node.content.replace(/^\s*<!--([^]*)-->\s*$/, '$1');
                      } else {
                        node.content = node.content.replace(/^\s*\/\*([^]*)\*\/\s*$/, '$1');
                      }
                    }
                    node.completed = true;
                  }
                  return node.content;
                }).join('\n');
              }
              block.completed = true;
              chain.pop(); // 移除引用链
            }
            content = block.content;
          }

          var processor = processors[attrs.encoding];
          if (processor) { // 编码处理器
            content = processor(content, attrs, dirname, options, tag, readBlock);
          }
          return content;
        case 'remove': // 必然移除的
          return '';
      }
      return all;
    };

    return buildBlock(blocks[[filename, '']].content, readBlock, true);
  };

  var buildFile = function(filename, options) {
    options = options || {};
    options.remove = options.remove || 'debug,test';
    options.trigger = options.trigger || 'release';
    options.removeList = String(options.remove).split(',');

    blocks = {};
    chain = []; // 引用链
    filename = path.resolve('', filename); // 使用绝对文件路径

    loadFile(filename, options); // 预处理，文件
    var result = replaceFile(filename, options);

    blocks = null;
    chain = null; // 引用链

    /*<debug>*/
    // console.log(result);
    /*</debug>*/
    return result;
  };

  /**
   * 添加一个编码器
   * @param{Function} processor 处理器 function(content, attrs, dirname, options, tag)
   */
  var setEncoding = function(encoding, processor) {
    if (!encoding || !processor) {
      return;
    }
    processors[encoding] = processor;
  };

  exports.build = buildFile;
  exports.setEncoding = setEncoding;
  exports.forceDirSync = forceDirSync;

}();