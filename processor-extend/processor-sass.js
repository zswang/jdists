var sass = require('node-sass');

/**
 * 解析 sass
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.data 数据项
 * @param {Object} scope 作用域
 * @param {Function} scope.getFilename 获取当前文件名
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return;
  }
  return sass.renderSync({
    data: content,
    file: scope.getFilename()
  }).css.toString();
};