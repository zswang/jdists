var jsdev = require('JSDev');

/**
 * JSDev 编码
 *
 * @see https://github.com/douglascrockford/JSDev
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.data 数据项
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }
  var tags;
  if (attrs.tags) {
    /*jslint evil: true */
    tags = scope.execImport(attrs.tags);
    if (/^\[[^]*\]$/.test(tags)) { // array
      tags = new Function(
        'return (' +
        tags +
        ');'
      )();
    } else {
      tags = tags.split(/\s*[,\n]\s*/);
    }
  } else {
    tags = [];
  }

  var comments;
  if (attrs.comments) {
    comments = scope.execImport(attrs.comments);
  } else {
    comments = null;
  }
  return jsdev(content, tags, comments);
};
