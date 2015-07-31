var fs = require('fs');
var crypto = require('crypto');

function md5(content) {
  var hash = crypto.createHash('md5');
  hash.update(content);
  return hash.digest('hex');
}

function btoa(content) {
  return (new Buffer(content)).toString('base64');
}

function xor(key, text) {
  var dict = md5(key);
  return btoa(text.split('').map(function (i, j) {
    return String.fromCharCode(i.charCodeAt() ^ dict[j % dict.length]);
  }).join(''));
}

/**
 * 解析 sass
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.data 数据项
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 */
module.exports = function (content, attrs, scope) {
  var key = scope.execImport(attrs.key) || '';
  return xor(attrs.key, content);
};