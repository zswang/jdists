var svgo = require('svgo');

/**
 * 压缩 svg 内容
 *
 * @param {string} content 文本内容
 */
module.exports = function (content) {
  var space;
  var match = content.match(/^[^\n\S]+/);
  if (match) {
    space = match[0];
  } else {
    space = '';
  }
  new svgo({
    plugins: [{
      cleanupIDs: {
        remove: false
      }
    }]
  }).optimize(content, function (svg) {
    if (svg.error) {
      return;
    }
    content = svg.data;
  });
  return space + content;
};