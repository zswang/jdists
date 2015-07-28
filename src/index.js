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
  "aaencode": require('../processor/processor-aaencode'),
  "autoprefixer": require('../processor/processor-autoprefixer'),
  "base64": require('../processor/processor-base64'),
  "clean-css": require('../processor/processor-clean-css'),
  "ejs": require('../processor/processor-ejs'),
  "glob": require('../processor/processor-glob'),
  "html": require('../processor/processor-html'),
  "jade": require('../processor/processor-jade'),
  "jhtmls": require('../processor/processor-jhtmls'),
  "jjencode": require('../processor/processor-jjencode'),
  "less": require('../processor/processor-less'),
  "md5": require('../processor/processor-md5'),
  "quoted": require('../processor/processor-quoted'),
  "svgo": require('../processor/processor-svgo'),
  "uglify": require('../processor/processor-uglify'),
  "url": require('../processor/processor-url'),
  "yml2json": require('../processor/processor-yml2json'),
  "zero": require('../processor/processor-zero'),
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
  },
  include: {
    encoding: 'original'
  },
  replace: {
    encoding: 'original'
  },
  ejs: {
    encoding: 'ejs'
  }
};

var defaultExclude = [
  '**/*.(png|jpeg|jpg|mp3|ogg|gif|eot|ttf|woff)',
  '**/*.min.+(js|css)'
];

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
  argv.trigger = argv.trigger || 'release';
  argv.remove = argv.remove || 'remove,test';
  if (typeof argv.clean === 'undefined') {
    argv.clean = true;
  }

  var scopes = {};
  var variants = {};
  var tags = JSON.parse(JSON.stringify(defaultTags));
  var excludeList = defaultExclude.slice();
  var removeList = argv.remove.split(/\s*,\s*/);
  var processors = {};
  for (var key in defaultProcessors) {
    processors[key] = defaultProcessors[key];
  }

  var rootScope = scope.create({
    clean: argv.clean,
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
 * @param {Function} processor 处理函数
 */
function registerProcessor(encoding, processor) {
  defaultProcessors[encoding] = processor;
}
exports.registerProcessor = registerProcessor;
