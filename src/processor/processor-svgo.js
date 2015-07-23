'use strict';

var SVGO = require('svgo');

/**
 * 压缩 svg 内容
 *
 * @param {string} content 文本内容
 */
module.exports = function (content) {
  var svgo = new SVGO({
    plugins: [{
      cleanupIDs: {
        remove: false
      }
    }]
  });
  return svgo.optimize(content, function (svg) {
    if (svg.error) {
      return;
    }
    result = svg.data;
  });
};