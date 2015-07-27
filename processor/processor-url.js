/**
 * URL 编码
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  return encodeURIComponent(content);
};