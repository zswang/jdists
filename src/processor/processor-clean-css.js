'use strict';

var cleanCSS = require('clean-css');

/**
 * 压缩 CSS
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  return new cleanCSS().minify(content).styles;
};