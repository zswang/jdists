/**
 * 字符截取
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.begin 起始点
 * @param {string} attrs.end 结束点
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 */
module.exports = function processor(content, attrs, scope) {
  var pattern = scope.execImport(attrs.pattern);
  var replacement = scope.execImport(attrs.replacement);
  var regex;
  if (/^\s*\/.*\/([img]{0,3})\s*$/.test(pattern)) {
    try {
      /*jslint evil: true */
      regex = new Function('return (' + pattern + ')')();
    } catch (ex) {
      regex = null;
    }
  } else {
    regex = pattern;
  }
  if (!regex) {
    return content;
  }
  return content.replace(regex, replacement || '');
};