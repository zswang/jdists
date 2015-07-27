var htmlEncodeDict = {
  '"': 'quot',
  '<': 'lt',
  '>': 'gt',
  '&': 'amp',
  ' ': 'nbsp'
};

/**
 * HTML 编码
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  return String(content).replace(/["<>& ]/g, function (all) {
    return '&' + htmlEncodeDict[all] + ';';
  });
};