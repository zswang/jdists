(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');

  /**
   * 内联资源处理器
   */
  module.exports = function(e) {
    var content = e.content;
    var dirname = e.dirname;

    return content.replace(
      /url\(\s*([^():?]+\.(png|jpg|jpeg|svg|gif|webp))\s*\)/g,
      function(all, file, type) {
        var filename = path.resolve(dirname, file);
        if (!fs.existsSync(filename)) {
          return all;
        }
        return 'url(data:image/' + type + ';base64,' +
          (new Buffer(fs.readFileSync(filename))).toString('base64') + ')';
      }
    );
  };

})();