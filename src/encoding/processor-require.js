(function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');

  /**
   * require 处理器
   */
  module.exports = function(e) {
    var content = e.content;
    var dirname = e.dirname;
    var attrs = e.attrs;
    var options = e.options;
    var build = e.jdists.build;
    var getAttrOrValue = e.getAttrOrValue;
    var attrBase = getAttrOrValue(attrs.base, '');
    var attrInsert = getAttrOrValue(attrs.insert, '');

    var modules = {
      '@': {
        name: '@',
        dirname: path.relative(path.join(dirname, attrBase), dirname),
        dependencies: [],
        rank: 0 // 被依赖多少次
      }
    };

    function updateRank(module) {
      if (!module) {
        return;
      }
      module.rank++;
      module.dependencies.forEach(function(name) {
        updateRank(modules[name]);
      });
    }

    function process(content, current) {
      return String(content).replace(/require\s*\(\s*(['"])([^'"]+)\1\s*\)/g,
        function(all, quote, moduleName) {
          if (/^\./.test(moduleName)) { // 有 ‘.’ 相对于当前文件
            var t = path.resolve(dirname, attrBase, // 绝对路径
              current.dirname, moduleName
            );
            moduleName = path.relative(path.join(dirname, attrBase), t); // 相对路径
          }
          var module;
          if (!modules[moduleName]) {
            module = modules[moduleName] = {
              name: moduleName,
              dirname: path.dirname(moduleName),
              dependencies: [], // 依赖
              rank: 0
            };
            if (current.dependencies.indexOf(moduleName) < 0) {
              current.dependencies.push(moduleName);
            }

            var filename = path.join(dirname, attrBase, moduleName + '.js');
            module.content = process(build(filename, options), module);
          }
          updateRank(module);
          return 'require(' + quote + moduleName + quote + ')';
        }
      );
    }

    content = process(content, modules['@']);
    var moduleList = [];
    for (var name in modules) {
      if (name !== '@') {
        moduleList.push(modules[name]);
      }
    }

    moduleList.sort(function(a, b) {
      return b.rank - a.rank;
    });
    /*<debug>*/
    // console.log(JSON.stringify(modules, null, 2));
    // console.log(JSON.stringify(moduleList, null, 2));
    /*</debug>*/

    var lines = [];
    moduleList.forEach(function(module) {
      if (attrInsert) {
        lines.push(attrInsert.replace(/\{\{name\}\}/g, function() {
          return module.name;
        }));
      }
      lines.push(module.content);
    });
    lines.push(content);
    return lines.join('\n');
  };

})();