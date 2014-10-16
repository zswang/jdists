void function() {

  'use strict';
  /**
   * jdists
   * 代码区域处理的工具
   * @author 王集鹄(wangjihu,http://weibo.com/zswang)
   * @version 2014-10-16
   */

  var fs = require('fs');
  var path = require('path');

  var cache; // 文件缓存
  var chain; // 引用链

  /**
   * 加载文件并编译
   * @param{String} filename 文件名
   * @param{String} remove 需要移除的块列表，默认为：'debug,test'
   * @return{String} 返回处理后文件内容
   */
  var build = function(filename, remove) {
    if (!fs.existsSync(filename)) {
      return '';
    }
    if (chain.indexOf(filename) >= 0) {
      throw new Error('Circular reference file.');
    }
    chain.push(filename); // 记录引用链

    var removeList = String(remove || 'debug,test').split(','); // 需要移除的块
    var dirname = path.dirname(filename); // 目录名，计算相对路径用

    var removeRegion = function (all, region) {
      if (removeList.indexOf(region) >= 0) {
        return '';
      }
      return all;
    };

    var includeFile = function (all, filename) {
      return build(path.resolve(dirname, filename), remove);
    };

    var includeRegion = function (all, filename, region) {
      var contents = [];
      function appendRegion(all, key, content) {
        if (key === region) {
          contents.push(content);
          return '';
        } else {
          return all;
        }
      }
      var result = '';
      filename = path.resolve(dirname, filename);
      if (cache[filename] || fs.existsSync(filename)) {
        if (!cache[filename]) {
          cache[filename] = build(filename, remove);
        }
        var content = cache[filename];
        content.replace(
          /<!--([\w-]+)-->([\s\S]*)<!--\/(\1)-->/g,
          appendRegion
        ).replace(
          /\/\*<([\w-]+)>\*\/([\s\S]*)?\/\*<\/(\1)>\*\//g,
          appendRegion
        );
        return contents.join('\n');
      } else {
        return '';
      }
    };

    var content = fs.readFileSync(filename);

    var result = String(content).replace(
      /<!--([\w-]+)-->[\s\S]*<!--\/(\1)-->/g,
      removeRegion
    ).replace(
      /\/\*<([\w-]+)>\*\/[\s\S]*?\/\*<\/(\1)>\*\//g,
      removeRegion
    ).replace(
      /\/\*<include\s+([\w\/\\\-\.]+)>\*\//g,
      includeFile
    ).replace(
      /<!--include\s+([\w\/\\\-\.]+)-->/g,
      includeFile
    ).replace(
      /\/\*<include\s+([\w\/\\\-\.]+)\s+([\w-]+)>\*\//g,
      includeRegion
    ).replace(
      /<!--include\s+([\w\/\\\-\.]+)\s+([\w-]+)-->/g,
      includeRegion
    ).replace(
      /function\s*\(\s*\)\s*\{\s*\/\*\!?([\s\S]*?)\*\/[\s;]*\}/g, // 处理函数注释字符串
      function(all, text) {
        return JSON.stringify(text);
      }
    );
    chain.pop(); // 移除引用链
    return result;
  };

  exports.build = function (filename, remove) {
    cache = {}; // 文件缓存
    chain = []; // 引用链
    return build(filename, remove);
  };

}();
