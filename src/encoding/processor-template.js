(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');

  var common = require('../common');

  var attrs2text = common.attrs2text;

  var jhtmls = require('jhtmls');
  var ejs = require('ejs');

  module.exports = function(e) {
    var getAttrOrValue = e.getAttrOrValue;

    var attrs = e.attrs;
    var attrEngine = getAttrOrValue(attrs.engine);

    if (!attrEngine) {
      return content;
    }

    var options = e.options;
    var content = e.content;
    var dirname = e.dirname;
    var getValue = e.getValue;
    var readBlock = e.readBlock;
    var buildBlock = e.buildBlock;
    var build = e.jdists.build;
    var attrData = getAttrOrValue(attrs.data);

    var render;
    switch (attrEngine) {
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
    if (attrData) {
      if (/^\s*[\[{"]/.test(attrData)) { // 直接 JSON 数据
        data = JSON.parse(attrData);
      } else {
        var text = build(path.join(dirname, attrData), e.options);
        data = JSON.parse(text);
      }
    } else {
      data = {};
    }
    return buildBlock(render(data), readBlock, true);
  };

})();