var babel = require('babel');

/**
 * babel 解析
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {Object} scope 作用域
 * @param {Function} scope.getDirname 获取当前目录名
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }

  return babel.transform(content, {
    filename: scope.getDirname()
  }).code;
};