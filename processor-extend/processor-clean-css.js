var cleanCSS = require('clean-css');

/**
 * 压缩 CSS
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {Object} attrs.compatibility 兼容性
 *     @see https://www.npmjs.com/package/clean-css#how-to-set-compatibility-mode
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 */
module.exports = function processor(content, attrs, scope) {
  return new cleanCSS({
    compatibility: scope.execImport(attrs.compatibility)
  }).minify(content).styles;
};