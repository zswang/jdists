/**
 * 编码成 base64
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  return new Buffer(content).toString('base64');
};