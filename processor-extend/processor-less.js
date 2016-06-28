var colors = require('colors');
var less = require('less');

/**
 * 解析 less
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.data 数据项
 * @param {Object} scope 作用域
 * @param {Function} scope.getDirname 获取当前目录
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }
  less.render(content, {
    paths: [scope.getDirname()],
    syncImport: true,
    relativeUrls: true
  }, function (error, output) {
    if (error) {
      console.error(colors.red(error));
      return content;
    }
    else {
      content = output.css;
    }
  });
  return content;
};