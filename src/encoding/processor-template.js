(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');

  var common = require('../common');

  var attrs2text = common.attrs2text;

  var jhtmls = require('jhtmls');
  var ejs = require('ejs');

  module.exports = function(e) {
    var attrs = e.attrs;

    if (!attrs.engine) {
      return content;
    }

    var options = e.options;
    var content = e.content;
    var dirname = e.dirname;
    var getValue = e.getValue;
    var readBlock = e.readBlock;
    var buildBlock = e.buildBlock;
    var build = e.jdists.build;

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
      } else if (/^#\s*([\w-]+)\s*$/.test(attrs.data)) { // 变量
        data = JSON.parse(getValue(attrs.data.substring(1).trim()));
      } else {
        var text = build(path.join(dirname, attrs.data));
        data = JSON.parse(text);
      }
    } else {
      data = {};
    }
    return buildBlock(render(data), readBlock, true);
  };

})();