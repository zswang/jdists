var jfogs = require('jfogs');

/**
 * jfogs 代码混淆
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.type 参数混淆方式
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }
  return jfogs.obfuscate(content, {
    type: scope.execImport(attrs.type)
  });
};