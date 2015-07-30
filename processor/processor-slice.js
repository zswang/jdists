/**
 * 字符截取
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.begin 起始点
 * @param {string} attrs.end 结束点
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 */
module.exports = function processor(content, attrs, scope) {
  if (!content) {
    return content;
  }
  var begin, end;
  if (attrs.begin) {
    begin = parseInt(scope.execImport(attrs.begin, ['argv', 'variant']), 10);
  }
  if (attrs.end) {
    end = parseInt(scope.execImport(attrs.end, ['argv', 'variant']), 10);
  }
  return content.slice(begin, end);
};