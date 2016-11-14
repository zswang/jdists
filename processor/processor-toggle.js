/**
 * 注释块切换
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {Object} scope 作用域
 * @param {Object} node 当前节点
 */
module.exports = function processor(content, attr, scope, node) {
  if (!content || node.type != 'block') {
    return content;
  }

  var lang = {
    'c': {
      prefix: '/*<',
      suffix: '>*/',
    },
    'pascal': {
      prefix: '(*<',
      suffix: '>*)',
    },
    'lua': {
      prefix: '--[[<',
      suffix: '>]]',
    },
    'python': {
      prefix: "'''<",
      suffix: ">'''",
    },
    'xml': {
      prefix: "<!--",
      suffix: "-->",
    },
  }[node.language];

  if (node.comment) {
    return node.prefix.slice(0, -1) + lang.suffix + node.content + lang.prefix + node.suffix.slice(1);
  }
  return node.prefix.slice(0, -lang.suffix.length) + '>' + node.content + '<' + node.suffix.slice(lang.prefix.length);
};