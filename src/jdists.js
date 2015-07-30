/*<jdists encoding="ejs" data="../package.json">*/
/**
 * @file <%- name %>
 *
 * <%- description %>
 * @author
     <% (author instanceof Array ? author : [author]).forEach(function (item) { %>
 *   <%- item.name %> (<%- item.url %>)
     <% }); %>
 * @version <%- version %>
     <% var now = new Date() %>
 * @date <%- [
      now.getFullYear(),
      now.getMonth() + 101,
      now.getDate() + 100
    ].join('-').replace(/-1/g, '-') %>
 */
/*</jdists>*/

var fs = require('fs');
var path = require('path');
var scope = require('./scope');
var colors = require('colors/safe');

/*<remove>*/
var defaultProcessors = {
  "ejs": require('../processor/processor-ejs'),
  "glob": require('../processor/processor-glob'),
  "html": require('../processor/processor-html'),
  "jhtmls": require('../processor/processor-jhtmls'),
  "quoted": require('../processor/processor-quoted'),
};
/*</remove>*/

/*<jdists encoding="glob" pattern="../processor/*.js" export="#processors" />*/
/*<jdists encoding="jhtmls" data="#processors">
var path = require('path');
!#{'var defaultProcessors = {'}
forEach(function (process) {
  "!#{path.basename(process, '.js').replace(/^processor-/, '')}": require('#{process.replace(/\.js$/, '')}'),
});
!#{'};'}
</jdists>*/

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
    var config =
      /*<jdists>
      JSON.parse(fs.readFileSync(configFilename))
      </jdists>*/

      /*<jdists encoding="indent" export="../.jdistsrc">*/
      {
        "clean": true,
        "tags": {
          "ejs": {
            "encoding": "ejs"
          },
          "xor": {
            "encoding": "xor"
          }
        },
        "processors": {
          "xor": "processor-extend/processor-xor.js"
        },
        "exclude": [
          "**/*.+(exe|obj|dll|bin|zip|rar)"
        ]
      }
      /*</jdists>*/
    ;

    if (typeof config.clean !== 'undefined') {
      clean = config.clean;
    }
    if (config.exclude instanceof Array) {
      excludeList = excludeList.concat(config.exclude);
    }
<<<<<<< HEAD

    options = options || {};

    if (/\.(png|jpeg|jpg|mp3|ogg|gif|eot|ttf|woff)$/.test(filename) ||
      (options.isBinary && options.isBinary(filename))) { // 已知二进制文件
      blocks[[filename, '']].isBinary = true;
      return;
    }

    var dirname = path.dirname(filename);

    var readBlock = function(all, fl, tag, attrText, fr, content, end, pos) {
      var attrs = getAttrs(tag, attrText, dirname);

      if (attrs.trigger &&
        !common.intersection(options.triggerList, attrs.trigger)) {
        return all;
=======
    if (config.processors) {
      for (var encoding in config.processors) {
        registerProcessor(encoding, config.processors[encoding]);
>>>>>>> cbml
      }
    }
<<<<<<< HEAD
    blocks[[filename, '']].content = content;

    return buildBlock(blocks[[filename, '']].content, readBlock);
  };

  /**
   * 替换文件内容
   * @param {string} filename 文件名，绝对路径
   * @param {Object} options 配置项
   * @return 返回替换后的内容
   */
  var replaceFile = function(filename, options) {
    if (!blocks[[filename, '']]) {
      return '';
    }

    var dirname = path.dirname(filename);

    var readBlock = function(all, fl, tag, attrText, fr, content, end) {

      var attrs = getAttrs(tag, attrText, dirname);

      if (attrs.trigger &&
        !common.intersection(options.triggerList, attrs.trigger)) {
        return all;
      }

      if (options.removeList.indexOf(tag) >= 0) {
        return '';
      }

      switch (tag) {
        case 'replace':
        case 'include':
          var isBinary = false;
          var blockfile = '';
          var blockname = '';

          if (variants[attrs.import]) { // 文件在变量中出现
            content = variants[attrs.import];
          }
          else if (attrs.block || attrs.file) {
            blockfile = attrs['@filename'] || getAttrOrValue(attrs.file, filename); // 默认当前文件名
            blockname = getAttrOrValue(attrs.block, ''); // 默认全部文件

            var key = [blockfile, blockname].join();
            var block = blocks[key];

            if (!block) { // 没有发现预加载的块
              loadFile(blockfile, options); // 预处理，文件
              block = blocks[key];
              if (!block) {
                return;
              }
            }

            if (!block.completed) {
              if (chain.indexOf(key) >= 0) { // 出现循环引用
                throw new Error('Circular reference block.');
              }
              chain.push(key);

              if (block.isFile) {
                if (block.isBinary) { // 二进制文件
                  block.content = fs.readFileSync(block.filename);
                }
                else {
                  block.content = replaceFile(block.filename, options);
                }
              }
              else {
                block.nodes.sort(function(a, b) { // 保证代码顺序
                  return a.pos - b.pos;
                });
                block.content = block.nodes.map(function(node) {
                  if (!node.completed) {
                    node.content = buildBlock(node.content, readBlock, true);
                    if (node.attrs.type === 'comment') {
                      if (/^\s*</.test(node.content)) {
                        node.content = node.content.replace(/^\s*<!--([^]*)-->\s*$/, '$1');
                      }
                      else {
                        node.content = node.content.replace(/^\s*\/\*([^]*)\*\/\s*$/, '$1');
                      }
                    }
                    node.completed = true;
                  }
                  return node.content;
                }).join('\n');
              }
              block.completed = true;
              chain.pop(); // 移除引用链
            }
            content = block.content;
            isBinary = block.isBinary;
          }

          var trim = getAttrOrValue(attrs.trim, '');
          if (/^(true|before)$/.test(trim)) { // 编码前，清理空白字符
            content = content.trim();
          }

          var processor;
          var encoding = getAttrOrValue(attrs.encoding, '');
          if (/^[\w-_]+$/.test(encoding)) { // 正常编码前
            processor = processors[encoding];
          }
          else if (encoding) { // 编码器来至变量
            var module = {
              exports: {}
            };
            new Function('require', 'module', 'exports', encoding)(
              require, module, module.exports
            );
            processor = module.exports;
          }
          if (typeof processor === 'function') { // 编码处理器
            if (!isBinary) { // 非二进制文件再次编译
              content = buildBlock(content, readBlock, true);
            }
            content = processor({
              content: content, // 内容
              attrs: attrs, // 属性
              dirname: blockfile ? path.dirname(blockfile) : dirname, // 当前内容所在目录
              blockfile: blockfile, // 块文件名
              blockname: blockname, // 块名
              options: options, // 选项
              tag: tag, // 标签
              buildBlock: buildBlock, // 编译一个块
              readBlock: readBlock, // 读取模块的函数
              getValue: getValue, // 获取变量的函数
              setValue: setValue, // 设置变量
              getAttrOrValue: getAttrOrValue, // 获取属性或者是变量
              filename: filename, // 输入文件
              jdists: exports // jdists 本身
            });
          }

          if (attrs.trim === 'after') { // 编码前，清理空白字符
            content = content.trim();
          }

          if (attrs.slice) {
            var params = attrs.slice.split(',');
            content = content.slice(params[0], params[1]);
          }
          content = buildBlock(content, readBlock, true);

          if (attrs.export) {
            if (/^#[\w-_]+$/.test(attrs.export)) { // 保存到虚拟文件中
              variants[attrs.export] = content;
            }
            else {
              if (attrs['@export']) {
                forceDirSync(path.dirname(attrs['@export']));
                fs.writeFileSync(attrs['@export'], content);
              }
            }
            return '';
          }
          return content;
        case 'remove': // 必然移除的
          return '';
      }

      return fl + tag + attrText + fr + buildBlock(content, readBlock, true) + end;
    };

    return buildBlock(blocks[[filename, '']].content, readBlock, true);
  };

  var buildFile = function(filename, options) {
    options = options || {};
    options.remove = options.remove || 'debug,test';
    options.trigger = options.trigger || 'release';
    options.triggerList = String(options.trigger).split(',');
    options.removeList = String(options.remove).split(',');
    options.clean = typeof options.clean === 'undefined' ? true : options.clean;

    if (options.nocache) {
      blocks = {};
    }

    chain = []; // 引用链
    filename = path.resolve('', filename); // 使用绝对文件路径

    loadFile(filename, options); // 预处理，文件
    var result = replaceFile(filename, options);
    chain = []; // 引用链

    if (options.clean) { // 清理空白字符
      result = clean(result);
=======
    if (config.tags) {
      for (var name in config.tags) {
        var item = config.tags[name];
        if (item) {
          tags[name] = item;
        }
      }
>>>>>>> cbml
    }
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
  if (!processor) {
    return;
  }
  if (typeof processor === 'function') {
    defaultProcessors[encoding] = processor;
    return true;
  } else if (typeof processor === 'string' && processor) {
    if (fs.existsSync(processor)) {
      return registerProcessor(
        encoding,
        scope.buildProcessor(fs.readFileSync(processor))
      );
    } else {
      return registerProcessor(
        encoding,
        scope.buildProcessor(processor)
      );
    }
  }
}
exports.registerProcessor = registerProcessor;