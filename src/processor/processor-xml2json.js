'use strict';

var xml2json = require('xml2json');

/**
 * 将 xml 转换成 json
 *
 * @param {string} content 文本内容
 */
module.exports = function processor(content) {
    return xml2json.toJson(content);
};
