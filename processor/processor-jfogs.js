var jfogs = require('jfogs');

/**
 * jfogs 代码混淆
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.type 参数混淆方式
 * @param {string} attrs.cross 添加混淆属性
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }
  var options = {};
  options.type = scope.execImport(attrs.type);
  options.cross = /^(yes|on|true|ok)$/.test(scope.execImport(attrs.cross));
  return jfogs.obfuscate(content, options);
};