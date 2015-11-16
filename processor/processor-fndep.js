/**
 * 处理函数依赖
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.data 数据项
 * @param {Object} scope 作用域
 * @param {Function} scope.contentScope 内容生成作用域
 */
module.exports = function (content, attrs, scope) {
  var fns = {};
  var list = [];
  var contentScope = scope.contentScope(content);
  var fnNodes = {};
  contentScope.querySelector('function*').forEach(function(node) {
    fnNodes[node.attrs.name] = {
      node: node,
      require: 0
    };
  });
  /**
   * 记录依赖关系
   *
   * @param {string} depend 依赖列表
   */
  function record(depend) {
    if (!depend) {
      return;
    }
    (depend || '').split(/\s*,\s*/).forEach(function(name) {
      var node = fnNodes[name].node;
      if (!fns[name]) {
        list.push(fnNodes[name]);
      }
      fns[name] = fnNodes[name];
      fns[name].require++;
      if (!node) {
        return;
      }
      record(node.attrs.depend);
    });
  }
  record(attrs.depend);
  list.sort(function (a, b) {
    return b.require - a.require;
  });
  return list.map(function (item) {
    var match = item.node.content.match(/^\n([^\S\n]+)/);
    var space = match ? match[1] : '';
    return space + contentScope.buildBlock(item.node);
  }).join('\n');
};