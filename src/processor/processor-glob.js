'use strict';

var glob = require('glob');

/**
 * 给文本加上双引号
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.pattern 匹配规则
 */
module.exports = function processor(content, attrs, scope) {
  var pattern = scope.parseAttr(attrs.pattern);
  return JSON.stringify(new glob(scope, {
    sync: true
  }));
};