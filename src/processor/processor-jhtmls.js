'use strict';

var jhtmls = require('jhtmls');

/**
 * jhtmls 模板渲染
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.data 数据项
 * @param {Object} argv 控制台选项
 * @param {Object} scope 作用域
 * @param {Function} scope.parseAttr 解析属性
 */
module.exports = function processor(content, attrs, argv, scope) {
  if (!content) {
    return content;
  }
  render = jhtmls.render(content);
  var data;
  if (attrs.data) {
    data = JSON.parse(scope.parseAttr(attrs.data));
  } else {
    data = null;
  }
  return render(data);
};
