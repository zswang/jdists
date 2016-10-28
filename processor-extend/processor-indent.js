/**
 * 代码缩进
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  if (!content) {
    return content;
  }
  var match = content.match(/^[^\n\S]+/);
  var space;
  if (match) {
    space = match[0].length;
    /*jslint evil: true */
    var regex = new Function('return (/^[^\\n\\S]{' + space + '}/gm)')();
    return content.replace(regex, '');
  }
  return content;
};