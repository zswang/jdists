/**
 * @file jdists
 *
 * Code block processing tools
 * @author
 *   zswang (http://weibo.com/zswang)
 * @version 2.2.4
 * @date 2018-08-18
 */
var fs = require('fs');
var path = require('path');
var scope = require('./scope');
var colors = require('colors/safe');
global.require = require; // ejs, jhtmls use
var defaultProcessors = {
  "ejs": require('../processor/processor-ejs'),
  "extract": require('../processor/processor-extract'),
  "fndep": require('../processor/processor-fndep'),
  "glob": require('../processor/processor-glob'),
  "html": require('../processor/processor-html'),
  "jhtmls": require('../processor/processor-jhtmls'),
  "jphps": require('../processor/processor-jphps'),
  "quoted": require('../processor/processor-quoted'),
  "regex": require('../processor/processor-regex'),
  "toggle": require('../processor/processor-toggle'),
};
var defaultTags = {
  jdists: {
    encoding: 'original'
  }
};
var defaultExclude = [
  '**/*.+(png|jpeg|jpg|mp3|ogg|gif|eot|ttf|woff)',
  '**/*.min.+(js|css)'
];
var defaultRemove = 'remove,test,debug';
var defaultTrigger = 'release';
/**
 * 编译 jdists 文件
 *
 * @param {string} filename 文件名或者是内容
 * @param {Object} argv 配置项
 * @param {boolean} argv.clean 是否清除连续空行，默认 true
 * @param {string} argv.remove 需要移除的标签列表，默认 "remove,test"
 * @param {string} argv.fromString 当为 true 时 filename 参数则看作内容
 * @param {Function} hook 预处理作用域
 * @return {string} 返回编译后的结果
 */
function build(filename, argv, hook) {
  // 处理默认值
  argv = argv || {};
  argv.trigger = argv.trigger || defaultTrigger;
  argv.remove = argv.remove || defaultRemove;
  var scopes = {};
  var variants = {};
  var tags = JSON.parse(JSON.stringify(defaultTags));
  var excludeList = defaultExclude.slice();
  var removeList = argv.remove.split(/\s*,\s*/);
  var processors = {};
  var clean = true;
  for (var key in defaultProcessors) {
    processors[key] = defaultProcessors[key];
  }
  // 处理配置文件
  var configFilename = argv.config || '.jdistsrc';
  if (fs.existsSync(configFilename)) {
    var config = JSON.parse(fs.readFileSync(configFilename));
    if (typeof config.clean !== 'undefined') {
      clean = config.clean;
    }
    if (config.exclude instanceof Array) {
      excludeList = excludeList.concat(config.exclude);
    }
    if (config.processors) {
      for (var encoding in config.processors) {
        registerProcessor(encoding, config.processors[encoding]);
      }
    }
    if (config.tags) {
      for (var name in config.tags) {
        tags[name] = config.tags[name];
      }
    }
  }
  else if (configFilename !== '.jdistsrc') {
    console.error(
      colors.red('Config file "%s" not exists.'), configFilename
    );
  }
  if (typeof argv.clean !== 'undefined') {
    clean = argv.clean;
  }
  var content;
  if (argv.fromString) {
    content = filename;
    filename = argv.path || 'none';
  }
  var rootScope = scope.create({
    fromString: argv.fromString,
    content: content,
    clean: clean,
    removeList: removeList,
    excludeList: excludeList,
    filename: filename,
    tags: tags,
    argv: argv,
    env: process.env,
    scopes: scopes,
    variants: variants,
    processors: processors
  });
  if (typeof hook === 'function') {
    hook(rootScope);
  }
  return rootScope.build();
}
exports.build = build;
/**
 * 注册默认处理器
 *
 * @param {string} encoding 编码名称
 * @param {Function|string} processor 处理函数
 */
function registerProcessor(encoding, processor) {
  if (!processor || !encoding) {
    return;
  }
  if (typeof processor === 'function') {
    defaultProcessors[encoding] = processor;
    return true;
  }
  else if (typeof processor === 'string' && processor) {
    if (fs.existsSync(processor)) {
      return registerProcessor(
        encoding,
        scope.buildProcessor(fs.readFileSync(processor))
      );
    }
    else {
      return registerProcessor(
        encoding,
        scope.buildProcessor(processor)
      );
    }
  }
}
exports.registerProcessor = registerProcessor;
exports.createScope = scope.create;