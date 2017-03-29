/**
 * ES6 模版字符串转化为 ES5- 字符串表达式
 *
 * @param {string} content 文本内容
 */
module.exports = function(content) {
  return content.replace(/`((\\.|[^])*?)`/g, function(all, text) {
    function encode(str) {
      return str.replace(/(\\.|[\n\r"])/g, function(char) {
        if (char.length === 2) {
          return char;
        }
        return {
          '\n': '\\n',
          '\r': '\\r',
          '"': '\\"'
        }[char];
      });
    }
    var result = '"';
    var reg = /\$\{([^]*?)\}/;
    var match = reg.exec(text);
    while (match) {
      text = RegExp["$'"];
      result += encode(RegExp['$`']) + '" + (' + match[1] + ') + "';
      match = reg.exec(text);
    }
    return result + encode(text) + '"';
  });
};