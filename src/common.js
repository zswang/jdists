(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');

  /**
   * 清理空白字符
   *
   * @param {string} text 字符串
   * @return {string} 返回处理后的字符串
   */
  function clean(text) {
    return String(text).replace(/^\s*$/gm, '') // 清除空行
      .replace(/\n{2,}/gm, '\n'); // 清除连接的空行
  }
  exports.clean = clean;

  /*
   * 保证目录存在
   * @param {string} dir 目录
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
   *
   * @param {string} content 内容
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
   *
   * @param {string} html
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
   *
   * @param {string} text 文本
   */
  function encodeHTML(text) {
    return String(text).replace(/["<>& ]/g, function(all) {
      return '&' + htmlEncodeDict[all] + ';';
    });
  }
  exports.encodeHTML = encodeHTML;

  /**
   * 获取属性对象
   *
   * @param {string} tag 标签
   * @param {string} attrText 属性文本
   * @param {string} dirname 文件目录名
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

  /*<function>*/
  /**
   * 判断两个数组是否存在交集
   *
   * @param {Array} a 数组 1
   * @param {Array} b 数组 2
   * @return {boolean} 返回数组是否出现相同的元素
   */
  function intersection(a, b) {
    if (a && b && a instanceof Array && b instanceof Array) {
      for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < b.length; j++) {
          if (a[i] === b[j]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /*<debug>
  console.log(intersection(1, [4, 5, 6])); // false
  console.log(intersection([1, 2, 3], [4, 5, 6])); // false
  console.log(intersection([1, 2, 3, 5], [4, 5, 6])); // true
  console.log(intersection([1, 2, 3, 7], [4, 5, 6])); // false
  console.log(intersection([1], [4, 5, 6])); // false
  console.log(intersection([4, 5, 6], [4])); // true
  // <debug>*/
  /*</function>*/

  exports.intersection = intersection;
})();