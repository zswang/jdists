var ts = require('typescript');

/**
 * 解析 XML
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.module 'amd' | 'umd' | 'system' | 'commonjs'
 * @param {string} attrs.target 'ES3' | 'ES5' | 'ES6'
 * @param {Object} scope 作用域
 */
module.exports = function processor(content, attrs, scope) {
  var compilerOptions = {
    // 1: preserve
    // 2: React
    // jsx: 2,

    // 1: CommonJS
    // 2: AMD
    // 3: UMD
    // 4: System
    module: ts.ModuleKind.CommonJS,

    // 0: ES3
    // 1: ES5
    // 2: ES6
    target: ts.ScriptTarget.ES3,
    noImplicitAny: false,
    sourceMap: false,
    inlineSources: true
  };

  if (/^AMD$/i.test(attrs.module)) {
    compilerOptions.module = ts.ModuleKind.AMD;
  } else if (/^UMD$/i.test(attrs.module)) {
    compilerOptions.module = ts.ModuleKind.UMD;
  } else if (/^System$/i.test(attrs.module)) {
    compilerOptions.module = ts.ModuleKind.System;
  } else if (/^CommonJS$/i.test(attrs.module)) {
    compilerOptions.module = ts.ModuleKind.CommonJS;
  }

  if (/^es5$/i.test(attrs.target)) {
    compilerOptions.target = ts.ScriptTarget.ES5;
  } else if (/^es6$/i.test(attrs.target)) {
    compilerOptions.target = ts.ScriptTarget.ES6;
  }

  return ts.transpileModule(content, {
    compilerOptions: compilerOptions,
    fileName: scope.getDirname(),
    reportDiagnostics: true,
    moduleName: undefined
  }).outputText;
};