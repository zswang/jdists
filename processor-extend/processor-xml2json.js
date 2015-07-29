var xml2json = require('xml2json');

/**
 * 解析 XML
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  return xml2json.toJson(content);
};