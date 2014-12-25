(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');

  function clean(text) {
    return String(text).replace(/^\s*$/gm, '') // 清除空行
      .replace(/\n{2,}/gm, '\n'); // 清除连接的空行
  }
  exports.clean = clean;

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
  exports.forceDirSync = forceDirSync;

  var crypto = require('crypto');
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
  exports.md5 = md5;

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
  exports.decodeHTML = decodeHTML;

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
  exports.encodeHTML = encodeHTML;

  /**
   * 获取属性对象
   * @param{String} tag 标签
   * @param{String} attrText 属性文本
   * @param{String} dirname 文件目录名
   * @return 返回属性对象，如果出现文件则计算绝对路径
   */
  var getAttrs = function(tag, attrText, dirname) {
    var result = {};
    if (!attrText) {
      return result;
    }
    // a="v1" b="v2" c="v3"
    attrText.replace(/\s*([\w-_.]+)\s*=\s*"([^"]+)"/g, function(all, key, value) {
      result[key] = decodeHTML(value);
      return '';
    });

    if (result.trigger) {
      result.trigger = result.trigger.split(',');
    }

    if (dirname) { // 需要处理目录
      if (/^(\*|&)$/.test(result.file)) { // file="&" 当前文件
        result.file = '';
      }
      if (result.file) {
        result['@filename'] = path.resolve(dirname, result.file); // 计算绝对路径
      }
      if (/^(replace|include)$/.test(tag) && result.export &&
        /^[^:#]+$/.test(result.export)) {
        result['@export'] = path.resolve(dirname, result.export); // 计算绝对路径
      }
      if (tag === 'script' && result.src &&
        /^[^:]+$/.test(result.src)) {
        result['@filename'] = path.resolve(dirname, result.src); // 计算绝对路径
      }
      if (tag === 'link' && result.href &&
        /^[^:]+$/.test(result.href)) {
        result['@filename'] = path.resolve(dirname, result.href); // 计算绝对路径
      }
    }
    return result;
  };
  exports.getAttrs = getAttrs;

  function attrs2text(attrs) {
    var result = [];
    for (var key in attrs) {
      if (!(/^@/.test(key))) {
        result.push(key + '="' + decodeHTML(attrs[key]) + '"');
      }
    }
    return result.join(' ');
  }

  exports.attrs2text = attrs2text;

})();