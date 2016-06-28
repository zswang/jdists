var postcss = require('postcss');
var autoprefixer = require('autoprefixer');

/**
 * 自动添加 CSS 前缀
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.browsers 兼容的浏览器环境
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 * @return {string} 返回处理后的内容
 * @example
 * <~jdists encoding="autoprefixer" browsers="iOS >= 7,Firefox >= 20" ~>
 * @color blue;
 * .rotate {
 *   animation: rotate 3s ease-in infinite;
 * }
 * @keyframes rotate {
 *   from {
 *     transform: rotate(0deg);
 *   }
 *   to {
 *     transform: rotate(360deg);
 *   }
 * }
 * <~/jdists~>
 */
module.exports = function processor(content, attrs, scope) {
  var browsers;
  if (attrs.browsers) {
    browsers = scope.execImport(
      attrs.browsers
    ).split(/\s*,\s*/);
  }
  return postcss(autoprefixer({
    browsers: browsers
  })).process(content).toString();
};