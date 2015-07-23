'use strict';

var uglify = require('uglify-js');

/**
 * 压缩 js 代码
 *
 * @param {string} content 文本内容
 */
module.exports = function (content) {
  return uglify.minify(content, {
    fromString: true
  }).code;
};