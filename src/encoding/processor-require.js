void

function() {

  'use strict';

  var fs = require('fs');
  var path = require('path');

  /**
   * 内联资源处理器
   */
  module.exports = function(content, attrs, dirname, options, tag, readBlock, buildFile) {
    var modules = {
      '@': {
        name: '@',
        dirname: path.relative(path.join(dirname, attrs.base), dirname),
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
            var t = path.resolve(dirname, attrs.base, // 绝对路径
              current.dirname, moduleName
            );
            t = path.relative(path.join(dirname, attrs.base), t); // 相对路径
            moduleName = '/' + t;
          }
          if (!modules[moduleName]) {
            var module = modules[moduleName] = {
              name: moduleName,
              dirname: path.dirname(moduleName),
              dependencies: [], // 依赖
              rank: 0
            };
            if (current.dependencies.indexOf(moduleName) < 0) {
              current.dependencies.push(moduleName);
            }

            var filename = path.join(dirname, attrs.base, moduleName + '.js');
            module.content = process(buildFile(filename, options), module);
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
      if (attrs.insert) {
        lines.push(attrs.insert.replace(/\{\{name\}\}/g, function() {
          return module.name;
        }));
      }
      lines.push(module.content);
    });
    lines.push(content);
    return lines.join('\n');
  };

}();