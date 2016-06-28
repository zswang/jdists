var metascript = require('metascript');

/**
 * metascript 编码
 *
 * @see https://github.com/dcodeIO/MetaScript
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 */
// <example>
// * @example metascript():base
// input:
//  <~jdists encoding="metascript" VERSION="1.0"~>
//  MyLibrary.VERSION = "/*?= VERSION */";
//  <~/jdists~>
// output:
//  <~jdists encoding="metascript" VERSION="1.0"~>
//  MyLibrary.VERSION = "1.0";
//  <~/jdists~>
// </example>
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }
  content = metascript.transform(content, scope.getDirname(), attrs);
  if (/^(off|false|no)$/.test(attrs.rework)) {
    return content;
  } else {
    return scope.compile(content);
  }
};
