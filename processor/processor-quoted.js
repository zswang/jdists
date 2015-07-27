/**
 * 给文本加上双引号
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  return JSON.stringify(content);
};