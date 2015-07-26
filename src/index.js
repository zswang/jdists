'use strict';

/**
 * @file jdists
 * 代码区域处理的工具
 * @author 王集鹄(wangjihu,http://weibo.com/zswang)
 * @version 2014-10-16
 */

var fs = require('fs');
var path = require('path');
var Scope = require('../src/scope');
var colors = require('colors/safe');

/*<remove>*/
var defaultProcessors = {
  "autoprefixer": require('./processor/processor-autoprefixer'),
  "base64": require('./processor/processor-base64'),
  "clean-css": require('./processor/processor-clean-css'),
  "ejs": require('./processor/processor-ejs'),
  "glob": require('./processor/processor-glob'),
  "jade": require('./processor/processor-jade'),
  "jhtmls": require('./processor/processor-jhtmls'),
  "less": require('./processor/processor-less'),
  "md5": require('./processor/processor-md5'),
  "original": require('./processor/processor-original'),
  "quoted": require('./processor/processor-quoted'),
  "svgo": require('./processor/processor-svgo'),
  "uglify": require('./processor/processor-uglify'),
  "yml2json": require('./processor/processor-yml2json'),
};
/*</remove>*/

/*<jdists encoding="glob" pattern="processor/*.js" export="#processors" />*/
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

function build(filename, argv) {

  var scopes = {};
  var variants = {};
  var processors = JSON.parse(JSON.stringify(defaultProcessors));
  var tags = JSON.parse(JSON.stringify(defaultTags));

  var rootScope = Scope.create({
    clean: argv.clean,
    remove: argv.remove,
    filename: filename,
    tags: tags,
    argv: argv,
    scopes: scopes,
    variants: variants,
    processors: processors
  });

  return rootScope.build();
}

exports.build = build;