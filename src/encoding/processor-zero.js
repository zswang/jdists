(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');

  function encodeUnicode(str){
    return String(str).replace(/[^\x00-\xff]/g, function(all){
      return escape(all).replace(/%u(....)/i, "\\u$1");
    });
  }

  /**
   * 零宽字符编码处理器
   * @see http://ucren.com/blog/archives/549
   */
  module.exports = function(content, attrs, dirname, options, tag, readBlock, buildFile) {
    var t = parseInt('10000000', 2);
    content = encodeUnicode(content).replace(/[^]/g, function(all) {
      return (t + all.charCodeAt()).toString(2).substring(1).replace(/[^]/g, function(n) {
        return {0:"\u200c",1:"\u200d"}[n];
      });
    });
    return 'eval("' + content + '".replace(/./g,function(a){return{"\u200c":0,"\u200d":1}[a]}).replace(/.{7}/g,function(a){return String.fromCharCode(parseInt(a,2))}));';
  };

})();