var autopreFixer = require('autoprefixer-core');

/**
 * 自动添加 CSS前缀
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.browsers 兼容的浏览器环境
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 */
module.exports = function processor(content, attrs, scope) {
  var browsers;
  if (attr.browsers) {
    browsers = scope.execImport(attr.browsers).split(/\s*,\s*/);
  }
  return autopreFixer.process(content, {
    browsers: browsers
  }).css;
};