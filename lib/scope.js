/**
 * @file jdists scope
 *
 * Code block processing tools
 * @author
 *   zswang (http://weibo.com/zswang)
 * @version 2.2.4
 * @date 2018-08-18
 */
var colors = require('colors');
var util = require('util');
var path = require('path');
var mkdirp = require('mkdirp');
var jsets = require('jsets');
var cbml = require('cbml');
var fs = require('fs');
var url = require('url');
var minimatch = require('minimatch');
/**
 * 是否无效的文件名
 *
 * @param {string} name 文件名
 * @return {boolean} 如果是无效文件名返回 true 否则返回 false
 */
function invalidFilename(name) {
  if (!name) {
    return;
  }
  return /[<>^|"'?*\t\r\f\v\n\x00-\x06\x0e-\x0f]/.test(name);
}
/**
 * 唯一标识，用来区分缓存内容是否修改
 *
 * @type {number}
 */
var guid = 0;
/**
 * 通过代码获取处理器
 *
 * @param {string} body 处理器代码
 * @return {Funciton} 返回处理器函数
 */
function buildProcessor(body) {
  if (/\bmodule\.exports\s*=/.test(body)) { // module 模式
    var module = {
      exports: {}
    };
    /*jslint evil: true */
    new Function('require', 'module', 'exports', body)(
      require, module, module.exports
    );
    return module.exports;
  }
  else { // 纯函数
    /*jslint evil: true */
    return new Function('require', 'return (' + body + ');')(require);
  }
}
exports.buildProcessor = buildProcessor;
/**
 * 创建作用域，一个文件对应一个作用域
 *
 * @param {Object} options 配置项
 * @param {string} options.filename 文件名
 * @param {Object} options.variants 变量集合
 * @param {Object} options.tags 被定义的 tags
 * @param {Object} options.processors 处理器集合
 * @param {Object} options.argv 控制台参数集合
 * @param {Object} options.scopes 作用域集合
 * @param {Array} options.excludeList 排除的文件名
 * @param {jdistsScope} options.rootScope 顶级作用域
 * @return {jdistsScope} 返回 jdists 作用域对象
 */
function create(options) {
  options = options || {};
  var filename = path.resolve('', options.filename || '');
  var tags = options.tags || {};
  var clean = options.clean;
  var removeList = options.removeList || [];
  var fromString = options.fromString;
  var contentString = options.content;
  var instance = {};
  var argv = options.argv || {};
  var env = options.env || global.process.env;
  var rootScope = options.rootScope || instance;
  var scopes = options.scopes || {};
  var processors = options.processors || {};
  var variants = options.variants || {};
  var cacheKeys = options.cacheKeys || {};
  var tokens = options.tokens;
  var excludeList = options.excludeList || [];
  /**
   * 清除空行
   *
   * @param {string} text 输入文本
   * @return {string} 返回处理后的结果
   */
  function cleanContent(content) {
    if (!clean) {
      return content;
    }
    return String(content).replace(/^[^\n\S]*$/gm, '') // 清除空行
      .replace(/\n{2,}/gm, '\n'); // 清除连接的空行
  }
  /**
   * 清除定义
   *
   * @param {string} text 输入文本
   * @return {string} 返回处理后的结果
   */
  function cleanDefine(content) {
    return String(content).replace(/^[^\S\n]*\n|\n[^\S\n]*$/g, '');
  }
  /**
   * 编译 jdists 文件，初始化语法树
   */
  function init() {
    if (tokens) {
      return;
    }
    if (fromString) {
      tokens = cbml.parse(contentString);
    }
    else {
      tokens = cbml.parse(fs.readFileSync(filename));
    }
    /*<debug>
    console.log(JSON.stringify(tokens, null, '  '));
    //</debug>*/
  }
  scopes[filename] = instance;
  /**
   * 编译完整内容，一般用于模板引擎二次处理 jdists
   *
   * @param {string} content 可能包含 jdists 代码块的内容
   * @return {string} 返回编译的结果
   *
   * @example
   * ```js
   * function processor(content) {
   *   if (!content) {
   *     return content;
   *   }
   *   return scope.compile(
   *     content.replace(/<~/g, '(*<').replae(/~>/g, '>*)')
   *   );
   * }
   * ```
   */
  function compile(content) {
    return buildBlock(cbml.parse(content));
  }
  instance.compile = compile;
  /**
   * 获取控制台参数
   *
   * @param {string} name 参数名
   * @return {string} 返回控制台参数
   */
  var getArgument = jsets.createGetter(instance, function (name) {
    return argv[name];
  }, false);
  instance.getArgument = getArgument;
  /**
   * 获取环境变量
   *
   * @param {string} name 变量名
   * @return {string} 返回环境变量值
   */
  var getEnvironment = jsets.createGetter(instance, function (name) {
    return env[name];
  }, false);
  instance.getEnvironment = getEnvironment;
  /**
   * 获取变量值
   *
   * @param {string} name 变量名
   * @return {*} 返回变量值
   */
  var getVariant = jsets.createGetter(instance, function (name) {
    if (!(name in variants)) {
      console.warn(
        colors.blue(
          'Variant "%s" is not set.'
        ), name
      );
    }
    return variants[name];
  }, true);
  instance.getVariant = getVariant;
  /**
   * 设置变量值
   *
   * @param {string} name 变量名
   * @param {*} value 变量值
   * @return {jdistsScope} 返回当前作用域
   */
  var setVariant = jsets.createSetter(instance, function (name, value) {
    if (variants[name] !== value) {
      variants[name] = value;
    }
  }, true);
  instance.setVariant = setVariant;
  /**
   * 获取顶级作用域
   *
   * @return {jdistsScope} 返回顶级作用域
   */
  instance.getRootScope = function () {
    return rootScope;
  };
  /**
   * 获取当前文件所在目录
   *
   * @return {string} 返回当前文件所在目录
   */
  function getDirname() {
    return path.dirname(filename);
  }
  instance.getDirname = getDirname;
  /**
   * 获取当前文件名，相对工作目录
   *
   * @return {string} 返回当前文件所在目录
   */
  function getFilename() {
    return url.format(path.relative('', filename));
  }
  instance.getFilename = getFilename;
  /**
   * 获取一个文件的作用域
   *
   * @param {string} filename 对应文件名
   * @return {jdistsScope} 返回文件对应的作用域
   */
  function fileScope(filename) {
    filename = path.resolve('', filename || '');
    var result = scopes[filename];
    if (!result) {
      result = create({
        clean: clean,
        removeList: removeList,
        excludeList: excludeList,
        rootScope: rootScope,
        filename: filename,
        argv: argv,
        scopes: scopes,
        processors: processors,
        variants: variants,
        cacheKeys: cacheKeys,
        tags: tags
      });
    }
    return result;
  }
  instance.fileScope = fileScope;
  instance.getScope = fileScope; // forward compatbility
  /**
   * 获取内容的作用域
   *
   * @param {string} content 对应文件名
   * @param {string=} file 对应文件名
   * @return {jdistsScope} 返回文件对应的作用域
   */
  function contentScope(content, file) {
    if (file) { // 已指定
      file = path.resolve(getDirname(), file);
    } else { // 未指定
      file = filename;
    }
    return create({
      fromString: true,
      content: content,
      clean: clean,
      removeList: removeList,
      excludeList: excludeList,
      rootScope: rootScope,
      filename: file,
      argv: argv,
      scopes: scopes,
      processors: processors,
      variants: variants,
      cacheKeys: cacheKeys,
      tags: tags
    });
  }
  instance.contentScope = contentScope;
  /**
   * 将内容进行编码
   *
   * @param {string} content 内容
   * @param {string} encoding 编码名称
   * @param {Object} attrs 属性集合
   * @return {Function} 返回编码后的结果
   */
  function process(content, encoding, attrs, node) {
    if (typeof content === 'undefined') {
      console.error(
        colors.red('process() : Undefined "content" parameters.')
      );
      return '';
    }
    if (!encoding || encoding === 'original') {
      return content;
    }
    var items = encoding.split(/\s*,\s*/);
    if (items.length > 1) {
      items.forEach(function (item) {
        content = process(content, item, attrs, node);
      });
      return content;
    }
    var processor = getProcessor(encoding);
    if (!processor) {
      console.error(
        colors.red('The "%s" processor does not exist.'), encoding
      );
      return content;
    }
    return processor(content, attrs, instance, node);
  }
  instance.process = process;
  /**
   * 获取处理器
   *
   * @inner
   * @param {string} encoding 编码名称
   * @return {Function} 返回名称对应的处理器，如果没有找到则返回 undefined
   */
  function getProcessor(encoding) {
    var result;
    if (/^[\w-_]+$/.test(encoding)) { // 标准编码器
      result = processors[encoding];
      if (result) {
        return result;
      }
      var file = path.join(__dirname, '../processor-extend', 'processor-' + encoding + '.js');
      if (fs.existsSync(file)) {
        processors[encoding] = require(file);
        return processors[encoding];
      }
      console.warn(
        colors.blue(
          'Processor "%s" is not registered.'
        ), encoding
      );
      return;
    }
    var item = processors[encoding];
    if (item) {
      if (item.cacheKey === cacheKeys[encoding]) { // 处理缓存
        return item.processor;
      }
      else {
        processors[encoding] = null;
      }
    }
    var body = execImport(encoding);
    if (!body || body.indexOf('function') < 0) {
      console.error(colors.red('Invalid encoding %j.'), encoding);
      return function (content) {
        return content;
      };
    }
    result = buildProcessor(body);
    if (/^[#@]/.test(encoding)) { // 缓存编码
      cacheKeys[encoding] = guid++;
      processors[encoding] = {
        cacheKey: cacheKeys[encoding],
        processor: result
      };
    }
    return result;
  }
  /**
   * 根据搜索表达式查询节点
   *
   * @param {string} selector 搜索表达式 "tagName[attrName=attrValue]\*"，如果表达式最后一个字符是 '*' 则返回数组
   * @return {jdistsNode|Array} 返回第一个匹配的节点
   */
  function querySelector(selector) {
    init();
    if (!selector) {
      return tokens;
    }
    var match = selector.match(
      /^\s*([\w_-]*)((\s*\[[\w_-]+\s*=\s*("([^\\"]*(\\.)*)*"|'([^\\']*(\\.)*)*'|[^\[\]]*)\])*)\s*(\*?)$/
    );
    if (!match) {
      console.warn(colors.blue('Invalid selector expressions %j.'), selector);
      return;
    }
    var tag = match[1];
    var attributes = [];
    var all = match[9] === '*';
    match[2].replace(/\s*\[([\w_-]+)\s*=\s*("([^\\"]*(\\.)*)*"|'([^\\']*(\\.)*)*'|[^\[\]]*)\]/g,
      function (match, name, value) {
        if (/^['"]/.test(value)) {
          /*jslint evil: true */
          value = new Function('return (' + value + ');')();
        }
        attributes.push({
          name: name,
          value: value
        });
      }
    );
    function check(node) {
      if (!node || !node.attrs) {
        return;
      }
      var flag;
      if (!tag || node.tag === tag) {
        flag = true;
        attributes.every(function (item) {
          if (item.value !== node.attrs[item.name]) {
            flag = false;
          }
          return flag;
        });
      }
      return flag;
    }
    var items;
    function scan(node) {
      if (check(node)) {
        if (items) {
          items.push(node);
        }
        return node;
      }
      var result;
      if (node.nodes) {
        node.nodes.every(function (item) {
          result = scan(item);
          return items || !result;
        });
      }
      return result;
    }
    if (all) {
      items = [];
      scan(tokens);
      return items;
    }
    else {
      return scan(tokens);
    }
  }
  instance.querySelector = querySelector;
  /**
   * 执行触发器
   *
   * @param {string} trigger 触发器表达式
   * @return {boolean} 返回触发器是否生效
   */
  function execTrigger(trigger) {
    if (!trigger) {
      return true;
    }
    // "trigger1[,trigger2]*"
    if (/^([\w-_]+)(,[\w-_]+)*$/.test(trigger)) {
      var a1 = String(getArgument('trigger')).split(',');
      var a2 = trigger.split(',');
      var flag = false;
      a1.every(function (item) {
        if (a2.indexOf(item) >= 0) {
          flag = true;
        }
        return !flag;
      });
      return flag;
    }
    // "@trigger === 'debug'"
    // "#variant === 'debug'"
    // ":environment === 'debug'"
    /*jslint evil: true */
    return new Function('return (' +
      trigger.replace(/(@|#|:)([\w-_]+)/g, function (all, flag, name) {
        if (flag === '@') {
          return JSON.stringify(getArgument(name));
        }
        else if (flag === ':') {
          return JSON.stringify(getEnvironment(name));
        }
        else {
          return JSON.stringify(getVariant(name));
        }
      }) +
      ')'
    )();
  }
  instance.execTrigger = execTrigger;
  /**
   * 执行文件排除
   *
   * @param {string} file 文件名
   * @return {boolean} 返回文件是否被排除
   */
  function execExclude(file) {
    var result = false;
    excludeList.every(function (item) {
      if (minimatch(file, item)) {
        result = true;
      }
      return !result;
    });
    return result;
  }
  /**
   * 执行数据导入
   *
   * @param {string} importation 导入项表达式 : "#variant" 内存, "@argv" 属性, "filename[?selector]" 文件和代码块
   * @param {Array=} froms 来源结婚，默认全部
   * @return {string} 返回导入的内容
   */
  function execImport(importation, froms) {
    if (!importation) {
      return importation;
    }
    if (importation.indexOf('#') === 0) { // variants
      if (froms instanceof Array && froms.indexOf('variant') < 0) {
        return importation;
      }
      return getVariant(importation.slice(1));
    }
    if (importation.indexOf('@') === 0) { // argv
      if (froms instanceof Array && froms.indexOf('argv') < 0) {
        return importation;
      }
      return getArgument(importation.slice(1));
    }
    if (importation.indexOf(':') === 0) { // env
      if (froms instanceof Array && froms.indexOf('env') < 0) {
        return importation;
      }
      return getEnvironment(importation.slice(1));
    }
    if (/^'([^\\']*(\\.)*)*'$/.test(importation)) { // 字符串输出
      /*jslint evil: true */
      return new Function('return (' + importation + ');')();
    }
    if (/^[\[\{"]/.test(importation)) { // 可能是 JSON
      return importation;
    }
    if (froms instanceof Array && froms.indexOf('file') < 0) {
      return importation;
    }
    // file
    var items = importation.split('?');
    var name = items[0];
    if (invalidFilename(name)) { // 无效文件名
      return importation;
    }
    var selector = items[1];
    var scope;
    if (!name) {
      scope = instance;
    }
    else {
      var file = path.resolve(getDirname(), name);
      if (!fs.existsSync(file)) { // 文件不存在原样
        return importation;
      }
      if (execExclude(file)) {
        if (!selector) {
          return String(fs.readFileSync(file));
        }
        else {
          console.error(
            colors.red('File "%s" has been ruled exclude, unable to code block import.'), file
          );
          return '';
        }
      }
      scope = fileScope(file);
    }
    if (selector) {
      var node = scope.querySelector(selector);
      if (!node) {
        console.error(
          colors.red('Selector "%s" is no matching nodes.'), selector
        );
        return '';
      }
      if (node instanceof Array) {
        return node.map(function (item) {
          return scope.buildBlock(item, true);
        }).join('\n');
      }
      return scope.buildBlock(node, true);
    }
    else {
      if (instance === scope) { // 不能引用自己
        console.error(
          colors.red('Cannot reference himself.')
        );
        return '';
      }
      return scope.build(instance);
    }
  }
  instance.execImport = execImport;
  /**
   * 执行数据导出
   *
   * @param {string} exportation 导出项表达式 : "#variant" 内存, "filename" 文件
   * @return {boolean} 返回导出是否成功
   */
  function execExport(exportation, content) {
    if (!exportation) {
      return;
    }
    if (exportation.indexOf('@') === 0) { // argv
      console.error(colors.red('Argv is readonly.'));
      return;
    }
    if (exportation.indexOf(':') === 0) { // env
      console.error(colors.red('Env is readonly.'));
      return;
    }
    if (exportation.indexOf('#') === 0) { // variants
      setVariant(exportation.slice(1), content);
      cacheKeys[exportation] = null;
      return true;
    }
    else if (!invalidFilename(exportation)) {
      var name = path.resolve(getDirname(), exportation);
      cacheKeys[name] = null;
      if (fs.existsSync(name)) {
        console.warn(
          colors.blue('File "%s" overwrite.'), name
        );
      }
      else {
        mkdirp.sync(path.dirname(name));
      }
      fs.writeFileSync(name, content);
      scopes[name] = null;
      return true;
    }
    else {
      console.error(colors.red('Export %j invalid.'), exportation);
      return;
    }
  }
  instance.execExport = execExport;
  function isYes(text) {
    return /^(true|on|yes|ok)$/i.test(text);
  }
  instance.isYes = isYes;
  function isNo(text) {
    return /^(false|off|no)$/i.test(text);
  }
  instance.isNo = isNo;
  /**
   * 编译 CBML 标签节点
   *
   * @param {jdistsNode} node 该节点
   * @param {boolean} isImport 是否为导入方式
   * @return {string} 返回编译后的内容，如果 isImport 为 true 时，不返回前后缀
   */
  function buildBlock(node, isImport) {
    if (!node) {
      return '';
    }
    init();
    if (node.pending) {
      var error = util.format('A circular reference. (%s:%d:%d)',
        filename, node.line || 0, node.col || 0
      );
      console.error(colors.red(error));
      throw error;
    }
    if (node.fixed) { // 已经编译过
      if (isImport) { // 未触发的 tag
        return node.content;
      }
      return node.value;
    }
    if (node.type === 'text') { // 文本节点直接返回
      return node.value;
    }
    node.pending = true;
    var value = '';
    var fixed = true;
    if (node.attrs && isYes(node.attrs.important)) {
      value = node.content;
    } else if (node.nodes) {
      node.nodes.forEach(function (item) {
        var text = buildBlock(item);
        if (!item.fixed && item.type !== 'text') {
          fixed = false;
        }
        if (item.altered) {
          value = value.replace(/[^\S\n]*$/, '');
        }
        value += text;
      });
    }
    var tagInfo = tags[node.tag];
    var isTrigger = true;
    node.altered = false;
    if (node.attrs && node.attrs.trigger) {
      isTrigger = execTrigger(node.attrs.trigger);
    }
    if (tagInfo && isTrigger) { // 已注册 tag
      if (node.attrs.import && node.attrs.import !== '&') {
        value = execImport(node.attrs.import);
        if (!/^[@:]/.test(node.attrs.import)) {
          fixed = false;
        }
      }
      else {
        value = cleanDefine(value);
      }
      value = process(value, node.attrs.encoding || tagInfo.encoding,
        node.attrs, node);
      if (/^\s+/.test(value)) {
        node.altered = true;
      }
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else {
        value = String(value);
      }
      node.content = value;
      if (node.attrs.export && node.attrs.export !== '&') {
        execExport(node.attrs.export, value);
        value = '';
        fixed = false;
      }
      else if (removeList.indexOf(node.tag) >= 0) { // 这是被移除的节点
        value = '';
      }
    }
    else if (node.tag) { // 并不是根目录
      node.content = cleanDefine(value);
      if (isTrigger && removeList.indexOf(node.tag) >= 0) { // 这是被移除的节点
        node.altered = false;
        value = '';
      }
      else if (node.type !== 'single') { // 非空内容标签
        value = node.prefix + value + node.suffix;
      }
      else {
        value = node.value;
      }
    }
    else {
      value = cleanContent(value);
    }
    node.pending = false;
    node.value = value;
    node.fixed = fixed;
    if (isImport) {
      return node.content;
    }
    return value;
  }
  instance.buildBlock = buildBlock;
  /**
   * 编译当前作用域
   *
   * @return {string} 返回编译后的结果
   */
  function build() {
    init();
    if (tokens.fixed) { // 已经被编译过
      return tokens.value;
    }
    return buildBlock(tokens);
  }
  instance.build = build;
  return instance;
}
exports.create = create;