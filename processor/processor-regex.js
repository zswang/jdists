/**
 * 字符截取
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.pattern 表达式
 * @param {string} attrs.replacement 替换内容
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 * @param {Function} scope.compile 变量 jdists 文本
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
  return scope.compile(content.replace(regex, replacement || ''));
};