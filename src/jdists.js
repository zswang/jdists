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
var scope = require('./scope');
var colors = require('colors/safe');

/*<remove>*/
var defaultProcessors = {
  "ejs": require('../processor/processor-ejs'),
  "glob": require('../processor/processor-glob'),
  "jhtmls": require('../processor/processor-jhtmls'),
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
    /*<jdists encoding="indent" export="../.jdistsrc">
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
        "**\/*.+(exe|obj|dll|bin|zip|rar)"
      ]
    }
    </jdists>*/
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
        var item = config.tags[name];
        if (item) {
          tags[name] = item;
        }
      }
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
  if (!processor || !encoding) {
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
exports.createScope = scope.create;