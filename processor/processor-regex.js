var colors = require('colors');

/**
 * 字符截取
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.pattern 表达式
 * @param {string} attrs.replacement 替换内容
 * @param {string} attrs.rework 是否重新编译
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 * @param {Function} scope.compile 变量 jdists 文本
 * @param {Function} scope.isNo 测试文字是否表达为假
 */
module.exports = function processor(content, attrs, scope) {
  var pattern = scope.execImport(attrs.pattern);
  var replacement = scope.execImport(attrs.replacement);
  var regex;
  if (/^\s*\/.*\/([img]{0,3})\s*$/.test(pattern) ||
    /^(['"]).*\1$/.test(pattern)) {
    try {
      /*jslint evil: true */
      regex = new Function('return (' + pattern + ')')();
    }
    catch (ex) {
      console.error(colors.red(ex.message));
      return content;
    }
  }
  else {
    regex = pattern;
  }
  if (!regex) {
    return content;
  }
  var result = content.replace(regex, replacement || '');
  if (scope.isNo(attrs.rework)) {
    return result;
  } else {
    return scope.compile(result);
  }
};