(function() {

  'use strict';

  /**
   * jdists
   * 代码区域处理的工具
   * @author 王集鹄(wangjihconcatu,http://weibo.com/zswang)
   * @version 2014-10-16
   */

  var fs = require('fs');
  var path = require('path');
  var colors = require('colors/safe');

  var common = require('./common');
  var clean = common.clean;
  var forceDirSync = common.forceDirSync;
  var md5 = common.md5;
  var decodeHTML = common.decodeHTML;
  var encodeHTML = common.encodeHTML;
  var getAttrs = common.getAttrs;

  var chain; // 引用链

  var blocks = {}; // key: filename, value: blocks
  var variants = {}; // key: name, value: content

  /**
   * 编码处理器集合
   * function(e)
    content // 内容
    attrs // 属性
    dirname // 当前内容所在目录
    blockfile // 块文件名
    blockname // 块名
    options // 选项
    tag // 标签
    buildBlock // 编译一个块
    readBlock // 读取模块的函数
    getValue // 获取变量的函数
    filename // 输入文件
    jdists // jdists 本身
   */
  var processors = {
    base64: function(e) {
      return (new Buffer(e.content)).toString('base64');
    },
    md5: function(e) {
      return md5(e.content);
    },
    url: function(e) {
      return encodeURIComponent(e.content);
    },
    html: function(e) {
      return encodeHTML(e.content);
    },
    string: function(e) {
      return JSON.stringify(e.content);
    },
    escape: function(e) {
      return escape(e.content);
    }
  };

  /**
   * 编译块
   * @param {string} content 内容
   * @param {Function} onread 读取函数
   * @param {boolean} isReplace 是否替换过程
   * @return 返回编译后的内容
   */
  var buildBlock = function(content, onread, isReplace) {
    var content = String(content);
    // @group
    // fl, tag, attrs, fr, content, end
    var regexList = [
      // xml
      /^(<!--)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?()()(\s*\/-->)/,
      /^(<!--)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?(\s*-->)([^]*?)(<!--\/\2-->)/,
      /^(<!--)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?(\s*>)([^]*?)(<\/\2-->)/,

      // c \ c++ \ c# \ java \ js \ css
      /^(\/\*<)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?()()(\s*\/>\*\/)/,
      /^(\/\*<)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?(\s*>\*\/)([^]*?)(\/\*<\/\2>\*\/)/,
      /^(\/\*<)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?(\s*>)([^]*?)(<\/\2>\*\/)/,

      // pascal \ delphi
      /^(\(\*<)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?()()(\s*\/>\*\))/,
      /^(\(\*<)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?(\s*>\*\))([^]*?)(\(\*<\/\2>\*\))/,
      /^(\(\*<)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?(\s*>)([^]*?)(<\/\2>\*\))/,

      // python
      /^('''<)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?()()(\s*\/>''')/,
      /^('''<)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?(\s*>''')([^]*?)('''<\/\2>''')/,
      /^('''<)([\w-_.]+)((?:\s*[\w-_.]+\s*(?:=\s*"[^"]*"))*)?(\s*>)([^]*?)(<\/\2>''')/
    ];

    var flags = ['<!--', '/*<', '(*<', "'''"];

    var result = '';
    var start = 0;
    while (start < content.length) {
      var min = Infinity;
      var regexIndex;

      flags.forEach(function(flag, index) {
        var t = content.substring(start).indexOf(flag);
        if (t >= 0 && t < min) {
          min = t;
          regexIndex = index * 3;
        }
      });

      if (min >= Infinity) { // 没有找到语法
        break;
      }

      var pointer = start + min;
      var match = false;

      for (var j = regexIndex; j <= regexIndex + 3; j++) {
        match = content.substring(pointer).match(regexList[j]);

        if (match) {
          match = match.map(function(item) { // 避免 undefined
            return item || '';
          });
          match.push(pointer);
          result += content.substring(start, pointer);
          result += onread.apply(this, match);

          start = pointer + match[0].length;
          break;
        }
      }

      if (!match) {
        result += content.substring(start, start + 1);
        start++;
      }
    }
    result += content.substring(start);

    if (isReplace) {
      result = String(result).replace( // 处理注释模板
        /\/\*#\*\/\s*function\s*\(\s*\)\s*\{\s*\/\*\!?([^]*?)\*\/[\s;]*\}/g,
        function(all, text) {
          return JSON.stringify(text);
        }
      ).replace(/\/\*,\*\/\s*(function(?:\s+[\w$_]+)?\s*\(\s*([^()]+)\s*\))/g, // 处理参数自识别
        function(all, func, params) {
          return '[' + params.replace(/([^\s,]+)/g, "'$&'") + '], ' + func;
        }
      );
    }

    return result;
  };

  /**
   * 加载文件
   * @param {string} filename 文件名，绝对路径
   * @param {Object} options 配置项
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
      console.warn(colors.red('File "%s" not exists.'), filename);
      blocks[[filename, '']].content = '';
      return;
    }

    options = options || {};

    if (/\.(png|jpeg|jpg|mp3|ogg|gif|eot|ttf|woff)$/.test(filename) ||
      (options.isBinary && options.isBinary(filename))) { // 已知二进制文件
      blocks[[filename, '']].isBinary = true;
      return;
    }

    var dirname = path.dirname(filename);

    var readBlock = function(all, fl, tag, attrText, fr, content, end, pos) {
      var attrs = getAttrs(tag, attrText, dirname);

      if (attrs.trigger &&
        !common.intersection(options.triggerList, attrs.trigger)) {
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

      if (attrs.file && /^[^#:]+/.test(attrs.file) &&
        /^(replace|include)$/.test(tag)) { // 需要引入文件
        loadFile(attrs['@filename'], options);
      }

      buildBlock(content, readBlock); // 处理嵌套
      return new Array(all.length + 1).join(' ');
    };

    var content = fs.readFileSync(filename);
    if (options.clean) { // 清理空白字符
      content = clean(content);
    }
    blocks[[filename, '']].content = content;

    return buildBlock(blocks[[filename, '']].content, readBlock);
  };

  /**
   * 替换文件内容
   * @param {string} filename 文件名，绝对路径
   * @param {Object} options 配置项
   * @return 返回替换后的内容
   */
  var replaceFile = function(filename, options) {
    if (!blocks[[filename, '']]) {
      return '';
    }

    var dirname = path.dirname(filename);

    var readBlock = function(all, fl, tag, attrText, fr, content, end) {

      var attrs = getAttrs(tag, attrText, dirname);

      if (attrs.trigger &&
        !common.intersection(options.triggerList, attrs.trigger)) {
        return all;
      }

      if (options.removeList.indexOf(tag) >= 0) {
        return '';
      }

      switch (tag) {
        case 'replace':
        case 'include':
          var isBinary = false;
          var blockfile = '';
          var blockname = '';

          if (variants[attrs.import]) { // 文件在变量中出现
            content = variants[attrs.import];
          }
          else if (attrs.block || attrs.file) {
            blockfile = attrs['@filename'] || getAttrOrValue(attrs.file, filename); // 默认当前文件名
            blockname = getAttrOrValue(attrs.block, ''); // 默认全部文件

            var key = [blockfile, blockname].join();
            var block = blocks[key];

            if (!block) { // 没有发现预加载的块
              loadFile(blockfile, options); // 预处理，文件
              block = blocks[key];
              if (!block) {
                return;
              }
            }

            if (!block.completed) {
              if (chain.indexOf(key) >= 0) { // 出现循环引用
                throw new Error('Circular reference block.');
              }
              chain.push(key);

              if (block.isFile) {
                if (block.isBinary) { // 二进制文件
                  block.content = fs.readFileSync(block.filename);
                }
                else {
                  block.content = replaceFile(block.filename, options);
                }
              }
              else {
                block.nodes.sort(function(a, b) { // 保证代码顺序
                  return a.pos - b.pos;
                });
                block.content = block.nodes.map(function(node) {
                  if (!node.completed) {
                    node.content = buildBlock(node.content, readBlock, true);
                    if (node.attrs.type === 'comment') {
                      if (/^\s*</.test(node.content)) {
                        node.content = node.content.replace(/^\s*<!--([^]*)-->\s*$/, '$1');
                      }
                      else {
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
            isBinary = block.isBinary;
          }

          var trim = getAttrOrValue(attrs.trim, '');
          if (/^(true|before)$/.test(trim)) { // 编码前，清理空白字符
            content = content.trim();
          }

          var processor;
          var encoding = getAttrOrValue(attrs.encoding, '');
          if (/^[\w-_]+$/.test(encoding)) { // 正常编码前
            processor = processors[encoding];
          }
          else if (encoding) { // 编码器来至变量
            var module = {
              exports: {}
            };
            new Function('require', 'module', 'exports', encoding)(
              require, module, module.exports
            );
            processor = module.exports;
          }
          if (typeof processor === 'function') { // 编码处理器
            if (!isBinary) { // 非二进制文件再次编译
              content = buildBlock(content, readBlock, true);
            }
            content = processor({
              content: content, // 内容
              attrs: attrs, // 属性
              dirname: blockfile ? path.dirname(blockfile) : dirname, // 当前内容所在目录
              blockfile: blockfile, // 块文件名
              blockname: blockname, // 块名
              options: options, // 选项
              tag: tag, // 标签
              buildBlock: buildBlock, // 编译一个块
              readBlock: readBlock, // 读取模块的函数
              getValue: getValue, // 获取变量的函数
              setValue: setValue, // 设置变量
              getAttrOrValue: getAttrOrValue, // 获取属性或者是变量
              filename: filename, // 输入文件
              jdists: exports // jdists 本身
            });
          }

          if (attrs.trim === 'after') { // 编码前，清理空白字符
            content = content.trim();
          }

          if (attrs.slice) {
            var params = attrs.slice.split(',');
            content = content.slice(params[0], params[1]);
          }
          content = buildBlock(content, readBlock, true);

          if (attrs.export) {
            if (/^#[\w-_]+$/.test(attrs.export)) { // 保存到虚拟文件中
              variants[attrs.export] = content;
            }
            else {
              if (attrs['@export']) {
                forceDirSync(path.dirname(attrs['@export']));
                fs.writeFileSync(attrs['@export'], content);
              }
            }
            return '';
          }
          return content;
        case 'remove': // 必然移除的
          return '';
      }

      return fl + tag + attrText + fr + buildBlock(content, readBlock, true) + end;
    };

    return buildBlock(blocks[[filename, '']].content, readBlock, true);
  };

  var buildFile = function(filename, options) {
    options = options || {};
    options.remove = options.remove || 'debug,test';
    options.trigger = options.trigger || 'release';
    options.triggerList = String(options.trigger).split(',');
    options.removeList = String(options.remove).split(',');
    options.clean = typeof options.clean === 'undefined' ? true : options.clean;

    if (options.nocache) {
      blocks = {};
    }

    chain = []; // 引用链
    filename = path.resolve('', filename); // 使用绝对文件路径

    loadFile(filename, options); // 预处理，文件
    var result = replaceFile(filename, options);
    chain = []; // 引用链

    if (options.clean) { // 清理空白字符
      result = clean(result);
    }

    /*<debug>*/
    // console.log(result);
    /*</debug>*/
    return result;
  };

  /**
   * 添加一个编码器
   * @param {string} encoding 编码名称
   * @param {Function} processor 处理器 function(e)
   */
  var setEncoding = function(encoding, processor) {
    if (!encoding || !processor) {
      return;
    }
    processors[encoding] = processor;
  };

  function getValue(id) {
    return variants[id];
  }

  function setValue(id, content) {
    return variants[id] = content;
  }

  function getAttrOrValue(text, defValue) {
    if (/^#[\w+_-]+$/.test(text)) {
      if (variants[text]) {
        return variants[text];
      }
    }
    return text || defValue;
  }

  exports.build = buildFile;
  exports.setEncoding = setEncoding;
  exports.replaceFile = replaceFile;
  exports.loadFile = loadFile;

  exports.getValue = getValue;
  exports.setValue = setValue;

})();