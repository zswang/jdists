/**
 * 字符截取
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }
  return content.trim();
};