/**
 * 将 JSON 第一级字段导出为变量
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {Object} scope 作用域
 * @param {Function} scope.execExport 导出数据
 * @example extract base
  ```input
  <~jdists encoding="extract"~>
  {
    "name": "extract",
    "version": "0.0.1",
    "private": true,
    "author": {
      "name": "zswang",
      "url": "http://weibo.com/zswang"
    }
  }
  <~/jdists~>
  <~jdists import="#name" /~>
  <~jdists import="#version" /~>
  <~jdists import="#private" /~>
  <~jdists import="#author" /~>
  ```
  ```output
  extract
  0.0.1
  true
  {"name":"zswang","url":"http://weibo.com/zswang"}
  ```
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return '';
  }

  /*jslint evil: true */
  var data = new Function(
    'return (' + content + ');'
  )();

  Object.keys(data).forEach(function (key) {
    scope.execExport('#' + key, data[key]);
  });

  return '';
};