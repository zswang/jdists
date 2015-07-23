/**
 * 处理文本
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.encoding 编码
 * @param {string} attrs.import 输入
 * @param {string} attrs.export 输出
 * @param {Object} scope 作用域
 * @param {Function} scope.complie 编译
 * @param {string} scope.tag 标签名
 * @return {string} 返回处理后的内容
 */
function process(content, attrs, scope) {
  if ('import' in attrs && attrs.import !== '&') {
    content = scope.parseAttr(attrs.import);
  }
  if ('encoding' in attrs) {
    content = scope.complie(content, attrs.encoding);
  }
  if ('export' in attrs && attrs.export !== '&') {
    content = scope.export(attrs.export);
  }
  return content;
}