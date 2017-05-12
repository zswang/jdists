/**
 * @see http://nginx.org/en/docs/http/ngx_http_ssi_module.html
 */
var path = require('path');
var fs = require('fs');

module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }
  return content.replace(/<!--#include\s+file="([^"]*)"-->/g, function (all, filename) {
    return fs.readFileSync(path.join(scope.getDirname(), filename));
  });
};