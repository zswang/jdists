var jade = require('jade');

/**
 * jade 模板渲染
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.data 数据项
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }
  var match = content.match(/^[^\n\S]+/);
  var space;
  if (match) {
    space = match[0].length;
    /*jslint evil: true */
    var regex = new Function('return (/^[^\\n\\S]{' + space + '}/gm)')();
    content = content.replace(regex, '');
    space = match[0];
  }
  render = jade.compile(content, {
    pretty: true
  });
  var data;
  if (attrs.data) {
    /*jslint evil: true */
    data = scope.execImport(attrs.data);
    if (typeof data === 'string') {
      data = new Function(
        'return (' + data + ');'
      )();
    }
  }
  else {
    data = null;
  }
  content = render(data);
  if (space) { // 需要补空白
    content = content.replace(/^/gm, space);
  }
  return content;
};