var handlebars = require('handlebars');

/**
 * handlebars 模板渲染
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
  var render = handlebars.compile(content);
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
  return render(data);
};