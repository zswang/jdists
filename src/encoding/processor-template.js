(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');

  var jdists = require('../jdists');

  var attrs2text = jdists.attrs2text;
  var buildBlock = jdists.buildBlock;

  var jhtmls = require('jhtmls');
  var ejs = require('ejs');

  module.exports = function(content, attrs, dirname, options, tag, readBlock, buildFile) {
    if (!attrs.engine) {
      return content;
    }
    var render;
    switch (attrs.engine) {
      case 'jhtmls':
        render = jhtmls.render(content);
        break;
      case 'ejs':
        render = ejs.compile(content);
        break;
      default:
        return content;
    }
    var data;
    if (attrs.data) {
      if (/^\s*[\[{"]/.test(attrs.data)) { // 直接 JSON 数据
        data = JSON.parse(attrs.data);
      } else {
        var text = buildFile(path.join(dirname, attrs.data));
        data = JSON.parse(text);
      }
    } else {
      data = {};
    }
    return buildBlock(render(data), readBlock, true);
  };

})();