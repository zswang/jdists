'use strict';

/**
 * @file jdists
 * 代码区域处理的工具
 * @author 王集鹄(wangjihu,http://weibo.com/zswang)
 * @version 2014-10-16
 */

var fs = require('fs');
var path = require('path');
var cbml = require('cbml');
var jdistsScope = require('../src/scope');
var colors = require('colors/safe');

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

function build(filename, argv) {

  var scopes = {};
  var variants = {};
  var processors = {};

  var root = jdistsScope.create({
    filename: filename,
    argv: argv,
    scopes: scopes,
    variants: variants,
    processors: processors
  });

  return root.build();
}

exports.build = build;