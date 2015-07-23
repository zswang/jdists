'use strict';

var autopreFixer = require('autoprefixer-core');

/**
 * 自动添加 CSS前缀
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  var browsers;
  if (browsers) {
    browsers = scope.parseAttr(attr.browsers).split(',');
  }
  else {
    browsers = ['Windows', 'Android', 'iOS', 'ChromeAndroid', 'FirefoxAndroid'];
  }
  return autopreFixer.process(content, {
    browsers: browsers
  }).css;
};