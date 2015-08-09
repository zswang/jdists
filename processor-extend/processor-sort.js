/**
 * 解析 sort
 *
 * @param {string} content 文本内容
 */
module.exports = function (content) {
  var lines = content.split(/\n/);
  return lines.sort().join('\n');
};