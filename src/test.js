(function() {

  'use strict';

  /**
   * jdists
   * 代码区域处理的工具
   * @author 王集鹄(wangjihconcatu,http://weibo.com/zswang)
   * @version 2014-10-16
   */

  var fs = require('fs');
  var path = require('path');
  var cbml = require('cbml');

  var colors = require('colors/safe');
  var blocks = {}; // key: filename, value: blocks
  var variants = {}; // key: name, value: content

  function buildNode(node, options) {
    var result = '';
    if (!node) {
      return result;
    }
    if (node.completed) {
      return node.value;
    }
    if (node.type === 'text') {
      return node.value;
    }

    if (node.type === 'cbml') {
      node.nodes.forEach(function(node) {
        result += buildNode(node);
      });
    } else if (node.tag === 'jdists') {
      var tokens = cbml.parse(node.content);
      result = buildNode(tokens);
      // TODO encoding
      if (node.attrs.encoding === 'base64') {
        result = (new Buffer(result)).toString('base64')
      } else if (node.attrs.encoding === 'string') {
        result = JSON.stringify(result);
      }
    }

    node.completed = true;
    node.value = result;
    return result;
  }

  function build(filename, options) {
    var key = [filename, ''];
    if (blocks[key]) {
      return blocks[key].value;
    }

    var tokens = cbml.parse(fs.readFileSync(filename));
    buildNode(tokens);
    blocks[key] = tokens;
    return blocks[key].value;
  }

  console.log(build('src/temp.js'));
})();