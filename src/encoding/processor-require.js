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
      String(content).replace(/require\s*\(\s*(['"])([^'"]+)\1\s*\)/g,
        function(all, quote, moduleName) {
          if (!modules[moduleName]) {
            var module = modules[moduleName] = {
              name: moduleName,
              dependencies: [], // 依赖
              rank: 0
            };
            if (current.dependencies.indexOf(moduleName) < 0) {
              current.dependencies.push(moduleName);
            }
            var filename = path.join(dirname, attrs.base, moduleName + '.js');
            module.content = buildFile(filename, options);
            process(module.content, module);
          }
          updateRank(module);
          return '';
        }
      );
    }

    process(content, modules['@']);
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