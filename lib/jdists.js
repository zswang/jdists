/**
 * @file jdists
 *
 * Code block processing tools
 * @author
 *   zswang (http://weibo.com/zswang)
 * @version 1.0.0
 * @date 2015-08-21
 */
var fs = require('fs');
var scope = require('./scope');
var colors = require('colors/safe');
var defaultProcessors = {
  "aaencode": require('../processor/processor-aaencode'),
  "autoprefixer": require('../processor/processor-autoprefixer'),
  "base64": require('../processor/processor-base64'),
  "candy": require('../processor/processor-candy'),
  "clean-css": require('../processor/processor-clean-css'),
  "ejs": require('../processor/processor-ejs'),
  "glob": require('../processor/processor-glob'),
  "html": require('../processor/processor-html'),
  "indent": require('../processor/processor-indent'),
  "jade": require('../processor/processor-jade'),
  "jfogs": require('../processor/processor-jfogs'),
  "jhtmls": require('../processor/processor-jhtmls'),
  "jjencode": require('../processor/processor-jjencode'),
  "jsdev": require('../processor/processor-jsdev'),
  "less": require('../processor/processor-less'),
  "md5": require('../processor/processor-md5'),
  "quoted": require('../processor/processor-quoted'),
  "regex": require('../processor/processor-regex'),
  "slice": require('../processor/processor-slice'),
  "svgo": require('../processor/processor-svgo'),
  "trim": require('../processor/processor-trim'),
  "uglify": require('../processor/processor-uglify'),
  "url": require('../processor/processor-url'),
  "yml2json": require('../processor/processor-yml2json'),
  "zero": require('../processor/processor-zero'),
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
 * @param {string} filename 文件名
 * @param {Object} argv 配置项
 * @param {boolean} argv.clean 是否清除连续空行，默认 true
 * @param {string} argv.remove 需要移除的标签列表，默认 "remove,test"
 * @return {string} 返回编译后的结果
 */
function build(filename, argv) {
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
  var rootScope = scope.create({
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