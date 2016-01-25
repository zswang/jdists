var jphps = require('jphps');

/**
 * jphps 模板生成
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  if (!content) {
    return content;
  }
  return jphps.build(content);
};
