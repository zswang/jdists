var jhtmls = require('jhtmls');

/**
 * jhtmls 模板渲染
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.data 数据项
 * @param {string} attrs.rework 是否重新编译
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 * @param {Function} scope.compile 变量 jdists 文本
 * @param {Function} scope.isNo 测试文字是否表达为假
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }
  render = jhtmls.render(content);
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
  if (scope.isNo(attrs.rework)) {
    return render(data);
  } else {
    return scope.compile(render(data));
  }
};
