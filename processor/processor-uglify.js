var uglify = require('uglify-js');

/**
 * 压缩 js 代码
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {String} attrs.ascii 是否只用 ascii
 */
module.exports = function (content, attrs) {
  return uglify.minify(content, {
    fromString: true,
    output: {
      ascii_only: /^(on|true|yes|ok|)$/.test(attrs.ascii)
    }
  }).code;
};