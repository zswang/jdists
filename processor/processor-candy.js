/**
 * 语法糖
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
  return content.replace( // 处理注释模板
    /\/\*#\*\/\s*function\s*\(\s*\)\s*\{\s*\/\*\!?([^]*?)\*\/[\s;]*\}/g,
    function(all, text) {
      return JSON.stringify(text);
    }
  ).replace(/\/\*,\*\/\s*(function(?:\s+[\w$_]+)?\s*\(\s*([^()]+)\s*\))/g, // 处理参数自识别
    function(all, func, params) {
      return '[' + params.replace(/([^\s,]+)/g, "'$&'") + '], ' + func;
    }
  );
};
