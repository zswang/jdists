(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');

  module.exports = function(e) {
    var attrs = e.attrs;
    var getAttrOrValue = e.getAttrOrValue;
    var attrPattern = getAttrOrValue(attrs.pattern, '');
    var attrReplacement = getAttrOrValue(attrs.replacement, '');
    var content = e.content;
    if (!attrReplacement || !content || !attrPattern) {
      return content;
    }

    var regex;

    if (/^\s*\/.*\/([img]{0,3})\s*$/.test(attrPattern)) {
      try {
        /*jslint evil: true */
        regex = eval('(' + attrPattern + ')');
      } catch (ex) {
        regex = null;
      }
    }

    if (!regex) {
      return content;
    }
    return String(content).replace(regex, attrReplacement);
  };

})();