var yaml = require('js-yaml');

/**
 * 将 yml 转换成 json
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
    return JSON.stringify(yaml.safeLoad(content));
};
