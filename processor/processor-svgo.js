var svgo = require('svgo');

/**
 * 压缩 svg 内容
 *
 * @param {string} content 文本内容
 */
module.exports = function (content) {
  return new svgo({
    plugins: [{
      cleanupIDs: {
        remove: false
      }
    }]
  }).optimize(content, function (svg) {
    if (svg.error) {
      return;
    }
    result = svg.data;
  });
};