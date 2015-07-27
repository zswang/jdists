var crypto = require('crypto');

/**
 * 计算 md5
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  var hash = crypto.createHash('md5');
  hash.update(content);
  return hash.digest('hex');
};