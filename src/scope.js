/**
 * @file jdists 作用域
 *
 * @author 王集鹄(wangjihu,http://weibo.com/zswang)
 * @version 2015-07-24
 */

var path = require('path');
var jsets = require('jsets');
var cbml = require('cbml');
var fs = require('fs');

/**
 * 清除空行
 *
 * @param {string} text 输入文本
 * @return {string} 返回处理后的结果
 */
function cleanContent(content) {
  return String(content).replace(/^\s*$/gm, '') // 清除空行
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
 * 唯一标识
 * @type {Number}
 */
var guid = 0;

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
 * @param {jdistsScope} options.rootScope 顶级作用域
 * @return {jdistsScope} 返回 jdists 作用域对象
 */
function create(options) {
  options = options || {};
  var filename = path.resolve('', options.filename || '');
  var tags = options.tags || {};
  var clean = options.clean;

  var argv = options.argv || {};
  var rootScope = options.rootScope || instance;
  var scopes = options.scopes || {};
  var processors = options.processors || {};
  var variants = options.variants || {};
  var cacheKeys = options.cacheKeys || {};
  var tokens = options.tokens;
  /**
   * 编译 jdists 文件，初始化语法树
   */
  function init() {
    if (tokens) {
      return;
    }
    tokens = cbml.parse(fs.readFileSync(filename));
    /*<debug>
    console.log(JSON.stringify(tokens, null, '  '));
    //</debug>*/
  }

  var instance = {};
  scopes[filename] = instance;

  function compile(content) {
    console.log('content: %j', content);
    return buildNode(cbml.parse(content));
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
  }, true);
  instance.getArgument = getArgument;

  /**
   * 获取变量值
   *
   * @param {string} name 变量名
   * @return {*} 返回变量值
   */
  var getVariant = jsets.createGetter(instance, function (name) {
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
      cacheKeys[name] = guid++;
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
   * 获取当前文件名
   *
   * @return {string} 返回当前文件名
   */
  instance.getFilename = function () {
    return filename;
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
   * 获取一个文件的作用域
   *
   * @param {string} filename 对应文件名
   * @return {jdistsScope} 返回文件对应的作用域
   */
  function getScope(filename) {
    filename = path.resolve('', filename || '');
    var result = scopes[filename];
    if (!result) {
      result = create({
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

  function process(content, encoding, attrs) {
    var processor = getProcessor(encoding);
    if (!processor) {
      return;
    }
    return processor(content, attrs, instance);
  }
  instance.process = process;

  /**
   * 获取处理器
   *
   * @param {string} encoding 编码名称
   * @return {Function} 返回名称对应的处理器，如果没有找到则返回 undefined
   */
  function getProcessor(encoding) {
    if (!encoding) {
      return;
    }
    var result;
    if (/^[\w-_]+$/.test(encoding)) { // 标准编码器
      result = processors[encoding];
      if (result) {
        return result;
      }

      var file = path.join(__dirname, 'processor', 'processor-' + encoding + '.js');
      if (fs.existsSync(file)) {
        return processors[encoding] = require(file);
      }
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
    if (/\bmodule\.exports\s*=/.test(body)) {
      var module = {
        exports: {}
      };
      new Function('require', 'module', 'exports', body)(
        require, module, module.exports
      );
      result = module.exports;
    }
    else {
      result = new Function('require', 'return (' + body + ');')(require);
    }
    if (/^[#@]/.test(encoding)) { // 缓存编码
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
   * @param {string} selecotr 搜索表达式 "tagName[attrName=attrValue]*"
   * @return {jdistsNode} 返回第一个匹配的节点
   */
  function querySelector(selecotr) {
    init();
    if (!selecotr) {
      return tokens;
    }

    var match = selecotr.match(
      /^\s*([\w_-]*)((\s*\[[\w_-]+\s*=\s*("([^\\"]*(\\.)*)*"|'([^\\']*(\\.)*)*'|[^\[\]]*)\])*)/
    );

    if (!match) {
      return;
    }

    var tag = match[1];
    var attributes = [];
    match[2].replace(/\s*\[([\w_-]+)\s*=\s*("([^\\"]*(\\.)*)*"|'([^\\']*(\\.)*)*'|[^\[\]]*)\]/g,
      function (all, name, value) {
        if (/^['"]/.test(value)) {
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
      if (!tag || node.tag === tag) {
        var flag = true;
        attributes.every(function (item) {
          if (item.value !== node.attrs[item.name]) {
            flag = false;
          }
          return flag;
        });
      }
      return flag;
    }

    function scan(node) {
      if (check(node)) {
        return node;
      }
      var result;
      node.nodes.every(function (item) {
        if (check(item)) {
          result = item;
        }
        return !result;
      });
      return result;
    }
    return scan(tokens);
  }
  instance.querySelector = querySelector;

  /**
   * 执行触发器
   *
   * @param {string} trigger 触发器表达式
   * @return {boolean} 返回触发器是否生效
   */
  function execTrigger(trigger) {
    // "@trigger == 'debug'"

  }
  instance.execTrigger = execTrigger;

  /**
   * 执行数据导入
   *
   * @param {string} importation 导入项表达式 : "#variant" 内存, "@argv" 属性, "filename[?selecotr]" 文件和代码块
   * @return {string} 返回导入的内容
   */
  function execImport(importation) {
    if (!importation) {
      return importation;
    }
    if (importation.indexOf('#') === 0) { // variants
      return getVariant(importation.slice(1));
    }
    if (importation.indexOf('@') === 0) { // argv
      return getArgument(importation.slice(1));
    }
    if (/^'([^\\']*(\\.)*)*'$/.test(importation)) { // 字符串输出
      return new Function('return (' + importation + ');')();
    }
    if (/^[\[\{"]/.test(importation)) { // 可能是 JSON
      return importation;
    }

    // file
    var items = importation.split('?');
    var name = items[0];
    if (invalidFilename(name)) { // 无效文件名
      return importation;
    }
    var selecotr = items[1];
    var scope;
    if (!name) {
      scope = instance;
    }
    else {
      scope = getScope(path.resolve(getDirname(), name));
    }
    if (!scope) {
      return importation;
    }
    if (selecotr) {
      var node = scope.querySelector(selecotr);
      if (!node) {
        return;
      }
      if (node.pending) { // 发生嵌套引用
        return;
      }
      return scope.buildNode(node, true);
    }
    else {
      if (instance === scope) { // 不能引用自己
        return;
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
    if (exportation.indexOf('#') === 0) { // variants
      setVariant(exportation.slice(1), content);
      return true;
    }
    else if (!invalidFilename(name)) {
      var name = path.resolve(getDirname(), exportation);
      fs.writeFileSync(name, content);
      scopes[name] = null;
      return true;
    }
  }
  instance.execExport = execExport;

  /**
   * 编译 CBML 标签节点
   *
   * @param {jdistsNode} node 该节点
   * @param {boolean} isImport 是否为导入方式
   * @return {string} 返回编译后的内容，如果 isImport 为 true 时，不返回前后缀
   */
  function buildNode(node, isImport) {
    init();
    if (!node) {
      return '';
    }
    var tagInfo = tags[node.tag];
    if (node.fixed) { // 已经编译过
      if (isImport && !tagInfo) { // 引入未注册 tag
        return node.content;
      }
      return node.value;
    }
    if (node.type === 'text') { // 文本节点直接返回
      return node.value;
    }

    var value = '';
    var fixed = true;
    if (!node.nodes) {
      value = node.content || node.value;
    }
    else {
      node.nodes.forEach(function (item) {
        value += buildNode(item);
        if (!item.fixed) {
          fixed = false;
        }
      });
    }

    if (tagInfo) { // 已注册 tag
      if (node.attrs.import && node.attrs.import !== '&') {
        value = execImport(node.attrs.import);
        if (clean) {
          value = cleanDefine(value);
        }
        if (node.attrs.import.indexOf('@') !== 0) {
          fixed = false;
        }
      }
      node.pending = true;
      value = process(value, node.attrs.encoding || tagInfo.encoding,
        node.attrs);
      node.pending = false;
      if (node.attrs.export && node.attrs.export !== '&') {
        execExport(node.attrs.export, value);
        value = '';
        fixed = false;
      }
    }
    else if (node.tag) { // 并不是根目录
      node.content = cleanDefine(value);
      value = node.prefix + value + node.suffix;
    }
    if (clean) {
      value = cleanContent(value);
      // console.log('value: %j', value);
    }

    node.value = value;
    node.fixed = fixed;
    if (isImport && !tagInfo) {
      return node.content;
    }
    return value;
  }
  instance.buildNode = buildNode;

  /**
   * 编译当前作用域
   *
   * @return {string} 返回编译后的结果
   */
  function build() {
    init();
    if (tokens.completed) {
      return tokens.value;
    }
    return buildNode(tokens);
  }
  instance.build = build;

  return instance;
}

exports.create = create;