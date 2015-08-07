/**
 * 对字符串进行 Unicode 编码
 *
 * @param {string} str 源字符串
 * @return {string} 返回编码后的内容
 */
function encodeUnicode(str) {
  return String(str).replace(/[^\x09-\x7f\ufeff]/g, function (all) {
    return '\\u' + (0x10000 + all.charCodeAt()).toString(16).substring(1);
  });
}

/**
 * 零宽字符编码处理器
 *
 * @see http://ucren.com/blog/archives/549
 */
module.exports = function (content) {
  if (!content) {
    return content;
  }
  var t = parseInt('10000000', 2);
  content = encodeUnicode(content).replace(/[^]/g, function (all) {
    return (t + all.charCodeAt()).toString(2).substring(1).replace(/[^]/g, function (n) {
      return {
        0: '\u200c',
        1: '\u200d'
      }[n];
    });
  });
  return '(function(){}).constructor("' + content + '".replace(/./g,function(a){return{"\u200c":0,"\u200d":1}[a]}).replace(/.{7}/g,function(a){return String.fromCharCode(parseInt(a,2))}))();';
};