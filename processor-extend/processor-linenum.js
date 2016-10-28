/**
 * 获取代码当前行数 ^linenum
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.data 数据项
 * @param {string} attrs.important 是否优先处理
 * @param {Object} scope 作用域
 * @param {Function} scope.getFilename 获取当前文件名
 * @param {Function} scope.isYes 测试文字是否表达为真
 * @param {Object} node 当前节点
 */
module.exports = function processor(content, attrs, scope, node) {
  if (!content) {
    return content;
  }
  var perline = node.prefix.split(/\n/).length - 1; // 前缀字符占有的行数

  var match1 = node.content.match(/^\s+/); // 实际内容
  var match2 = content.match(/^\s+/); // 处理内容

  var l1 = match1 ? match1[0].split(/\n/).length - 1 : 0;
  var l2 = match2 ? match2[0].split(/\n/).length - 1 : 0;
  perline -= (l2 - l1) + 1;

  var result = String(content).split(/\n/).map(function (line, index) {
    return line.replace(/\^linenum/g, function () {
      return scope.getFilename() + ':' + (perline + node.line + index + 1);
    });
  }).join('\n');
  if (scope.isYes(scope.execImport(attrs.important))) {
    return scope.compile(result);
  } else {
    return result;
  }
};