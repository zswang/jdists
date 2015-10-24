# jdists 强大的代码块预处理工具

标签： jdists 教程

---

[![Build Status](https://img.shields.io/travis/zswang/jdists/master.svg)](https://travis-ci.org/zswang/jdists)
[![NPM version](https://img.shields.io/npm/v/jdists.svg)](http://badge.fury.io/js/jdists)
[![NPM download](https://img.shields.io/npm/dm/jdists.svg)](https://www.npmjs.com/package/jdists)
[![Coverage Status](https://coveralls.io/repos/zswang/jdists/badge.svg?branch=master&service=github)](https://coveralls.io/github/zswang/jdists?branch=master)

![jdists logo](https://cloud.githubusercontent.com/assets/536587/9022251/4d33427c-38a1-11e5-98e5-37b6a1c69a85.png)

## 背景

### 软件发布流程

![code pretreatment](https://cloud.githubusercontent.com/assets/536587/9024268/5275fe58-38f8-11e5-9306-89e6c1840f97.png)

通常软件发布时会将源文件做一次「预处理」再编译成可执行文件，才发布到市场。

### 「预处理」的目的主要是出于以下几点

* 配置线上运行环境，如调试服务地址需变更为实现线上地址；
* 减少执行程序的大小，移除没有使用的代码或资源并压缩；
* 增加逆向工程的成本，给代码做混淆（包括改变标识符和代码结构），降低可读性；
* 移除或增加调试功能，关闭或开启一些特权后门。

> 一些 IDE 已在「编译」时集成了「预处理」功能。

## 什么是 jdists

jdists 是一款强大的代码块预处理工具。

### 什么是「代码块」(code block)？

通常就是注释或注释包裹的代码片段，用于表达各种各样的含义。

> 举个栗子

+ TODO 注释，表示代码中待完善的地方
```js
/* TODO 功能待开发 */
```
----
+ [wiredep][1] 注释，表示引入 bower 组件依赖的 css 资源
```html
	<!-- bower:css -->
	<link rel="stylesheet" href="bower_components/css/bootstrap.css" />
	<!-- endbower -->
```
----
+ [jshint.js][2] 顶部注释，表示版权声明
```js
/*!
 * JSHint, by JSHint Community.
 *
 * This file (and this file only) is licensed under the same slightly modified
 * MIT license that JSLint is. It stops evil-doers everywhere:
 *
 *   Copyright (c) 2002 Douglas Crockford  (www.JSLint.com)
 * .........
 */
```
----
+ jshint.js 另一部分注释，表示代码检查配置项
```js
/*jshint quotmark:double */
/*global console:true */
/*exported console */
```
总之，本文所指「代码块」就是有特殊意义的注释。

### 什么是「代码块预处理」？

指在代码编译之前，将代码文件按代码块粒度做一次编码或解析。

> 举个栗子，原本无效的代码片段，经过编码后变成了有效代码。

预处理前：
```js
/*<jdists>
console.log('Hello World!');
</jdists>*/
```

预处理后：
```js
console.log('Hello World!');
```

### 市面上还有哪一些「代码块预处理工具」？

市面上有不少，这里只列两个比较典型的。

+ 已被普遍使用的 [JSDoc][3]，功能是将代码中的注释抽离成 API 文档。

```js
/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
function Book(title, author) {
}
```
----
+ [JSDev][4] 是由 JSON 之父 Douglas Crockford 编写。jdists 与 JSDev 的功能类似，但 jdists 功能要复杂很多。

C command line example:

```shell
	 jsdev -comment "Devel Edition." <input >output test_expose enter:trace.enter exit:trace.exit unless:alert
```

JavaScript:
```js
		output = JSDEV(input, [
				"test_expose",
				"enter:trace.enter",
				"exit:trace.exit",
				"unless:alert"
		] , ["Devel Edition."]);
```
input:
```js
		// This is a sample file.

		function Constructor(number) {
				/*enter 'Constructor'*/
				/*unless(typeof number !== 'number') 'number', "Type error"*/
				function private_method() {
						/*enter 'private_method'*/
						/*exit 'private_method'*/
				}
				/*test_expose
						this.private_method = private_method;
				*/
				this.priv = function () {
						/*enter 'priv'*/
						private_method();
						/*exit 'priv'*/
				}
				/*exit "Constructor"*/
		}
```

output:

```js
		// Devel Edition.
		// This is a sample file.

		function Constructor(number) {
				{trace.enter('Constructor');}
				if (typeof number !== 'number') {alert('number', "Type error");}
				function private_method() {
						{trace.enter('private_method');}
						{trace.exit('private_method');}
				}
				{
						this.private_method = private_method;
				}
				this.priv = function () {
						{trace.enter('priv');}
						private_method();
						{trace.exit('priv');}
				}
				{trace.exit("Constructor");}
		}
```

lightly minified:

```js
		function Constructor(number) {
				function private_method() {
				}
				this.priv = function () {
						private_method();
				}
		}
```

### 预处理以「代码块」为粒度有什么优势？
 
* 处理速度快，按需对代码块部分进行指定编码；
* 控制力更强，可以控制每个字符的变化；
* 不干扰编译器，编译器天然忽略注释。

### 现有「代码块预处理工具」存在什么问题？

+ 不容易学习和记忆。`begin` 还是 `start`，前缀还是后缀？
```
<!-- 乐居广告脚本 begin-->
/* jshint ignore:start */
/* TODO 待开发功能 */
```

+ 是否存在闭合不明显。什么时候生效，什么时候失效？
```
/*jshint unused:true, eqnull:true*/
/*test_expose
		this.private_method = private_method;
	*/
```

+ 没有标准，不能跨语言。JSDev 和 JSDoc 不能用于其他主流语言，如 Python、Lua 等。

## 代码预处理的思考

问题也就是：怎么定义、怎么处理、什么情况下触发。

### 怎么定义「代码块」？

本人拟订了一个基于「XML 标签」+「多行注释」的代码块规范： [CBML][5]

![CBML](https://cloud.githubusercontent.com/assets/536587/9024562/a4dbd27a-3908-11e5-9c2c-50156a04d398.png)

优势：

* 学习成本低，XML、多行注释都是大家熟知的东西；
* 标签是否闭合很明显；
* 支持多种主流编程语言。

### 怎么处理「代码块」？

处理的步骤无外乎就是：输入、编码、输出

![processor](https://cloud.githubusercontent.com/assets/536587/9024576/3bdbae70-3909-11e5-9b3e-f4ba83b5e842.png)

经过解析 CBML 的语法树，获取 `tag` 和 `attribute` 两个关键信息。

如果 `tag` 值为 `<jdists>` 就开始按 jdists 的规则进行处理。

> 整个处理过程由四个关键属性决定：
> 1. `import=` 指定输入媒介
> 2. `export=` 指定输出媒介
> 3. `encoding=` 指定编码集合
> 4. `trigger=` 指定触发条件

举个例子
```js
/*<jdists export="template.js" trigger="@version < '1.0.0'">
	var template = /*<jdists encoding="base64,quoted" import="main.html?template" />*/
/*</jdists>
```

这里有两个代码块，还是一个嵌套结构

* 外层代码块属性 `export="template.js"` 指定内容导出到文件 `template.js`（目录相对于当前代码块所在的文件）。
* 外层代码块属性  `trigger="@version < '1.0.0'"` 指定命令行参数 `version` 小于 `'1.0.0'` 才触发。
* 内层代码块属性 `encoding="base64,quoted"` 表示先给内容做一次 `base64` 编码再做一次 `quoted` 即，编码成字符串字面量。

### 什么情况下触发？

有两个触发条件：

1. 当 `tag` 值为 `<jdists>` 或者是被配置为 `jdists` 标签
2. 当属性 `trigger=` 表达式判断为 `true`

## jdists 基本概念

### 代码块 block

由 tag 标识的代码区域

代码块主要有如下三种形式：
* 空内容代码块，没有包裹任何代码
```js
/*<jdists import="main.js" />*/
```

* 有效内容代码块，包裹的内容是编译器会解析
```js
/*<jdists encoding="uglify">*/
	function format(template, json) {
		if (typeof template === 'function') { // 函数多行注释处理
			template = String(template).replace(
				/[^]*\/\*!?\s*|\s*\*\/[^]*/g, // 替换掉函数前后部分
				''
			);
		}
		return template.replace(/#\{(.*?)\}/g, function(all, key) {
				return json && (key in json) ? json[key] : "";
		});
	}
/*</jdists>*/
```

* 无效内容代码块，包裹的内容也在注释中
```js
/*<jdists>
console.log('version: %s', version);
<jdists>*/
```

### 标签 tag

* `<jdists>` | 自定义

### 属性 attribute

* `import=` 指定输入媒介
* `export=` 指定输出媒介
* `encoding=` 指定编码集合
* `trigger=` 指定触发条件

### 媒介 medium

* `&content` 默认为 "&"
* `file` 文件
		> 如：
		> `main.js`
		> `index.html`

* `#variant` 变量
		> 如：
		> `#name`
		> `#data`

* `[file]?block` *readonly* 代码块，默认 `file` 为当前文件
		> 如：
		> `filename?tagName`
		> `filename?tagName[attrName=attrValue]`
		> `filename?tagName[attrName=attrValue][attrName2=attrValue2]`

* `@argument` *readonly* 控制台参数
		> 如：
		> `@output`
		> `@version`

* `:environment` *readonly* 环境变量
		> 如：
		> `:HOME`
		> `:USER`

* `[...]`、`{...}` *readonly* 字面量
		> 如：
		> `[1, 2, 3, 4]`
		> `{title: 'jdists'}`

* `'string'` *readonly* 字符串
		> 如：
		> `'zswang'`

### 触发器 trigger

触发器有两种表达式

* 触发器名列表与控制台参数 `--trigger` 是否存在交集，存在则被触发

> 当 `$ jdists ... --trigger release` 触发

```html
<!--remove trigger="release"-->
<label>release</label>
<!--/remove-->
```

* 将变量、属性、环境变量表达式替换后的字面量结果是否为 true

> 当 `$ jdists ... --version 0.0.9` 触发

```html
<!--remove trigger="@version < '1.0.0'"-->
<label>1.0.0+</label>
<!--/remove-->
```

## 如何扩展 jdists

可以参考项目中 processor 目录，中自带编码器的写法

举个栗子
```js
var ejs = require('ejs');

/**
 * ejs 模板渲染
 *
 * @param {string} content 文本内容
 * @param {Object} attrs 属性
 * @param {string} attrs.data 数据项
 * @param {Object} scope 作用域
 * @param {Function} scope.execImport 导入数据
 * @param {Function} scope.compile 二次编译 jdists 文本
 */
module.exports = function processor(content, attrs, scope) {
	if (!content) {
		return content;
	}
	var render = ejs.compile(content);
	var data;
	if (attrs.data) {
		/*jslint evil: true */
		data = new Function(
			'return (' +
			scope.execImport(attrs.data) +
			');'
		)();
	}
	else {
		data = null;
	}
	return scope.compile(render(data));
};
```

详情参考：[jdists Scope](https://github.com/zswang/jdists/wiki/Scope)

## 用例

### 代码编译成 dataurl

通过块导入

```html
<!--remove-->
<script>
/*<jdists encoding="base64" id="code">*/
console.log('hello world!');
/*</jdists>*/
</script>
<!--/remove-->

<!--jdists>
<script src="data:application/javascript;base64,/*<jdists import="?[id=code]" />*/"></script>
</jdists-->
```

通过变量导入

```html
<!--remove-->
<script>
/*<jdists encoding="base64" export="#code">*/
console.log('hello world!');
/*</jdists>*/
</script>
<!--/remove-->

<!--jdists>
<script src="data:application/javascript;base64,/*<jdists import="#code" />*/"></script>
</jdists-->
```

## 实战

* [给源文件添加版权信息](https://github.com/zswang/jdists/wiki/%5Bcase%5DBuild-copyright)
* [代码混合加密](https://github.com/zswang/jdists/wiki/%5Bcase%5DCode-mixed-encryption)
* [预制默认插件](https://github.com/zswang/jdists/wiki/%5Bcase%5DPrefabricated-default-plugin)
* [防止静态资源被搜索](https://github.com/zswang/jdists/wiki/%5Bcase%5DTo-prevent-the-reverse-engineering)
* [引入其他代码处理工具](https://github.com/zswang/jdists/wiki/%5Bcase%5DThe-introduction-of-third-party-code-processing-tools)

## 如何使用

jdists 依赖 node v0.10.0 以上的环境

### 安装 

`$ npm install jdists [-g]`

### 命令行

```
Usage:

		jdists <input list> [options]

Options:

		-r, --remove                 Remove block tag name list (default "remove,test")
		-o, --output                 Output file (default STDOUT)
		-v, --version                Output jdists version
		-t, --trigger                Trigger name list (default "release")
		-c, --config                 Path to config file (default ".jdistsrc")
```

### JS

```js
var content = jdists.build(filename, {
		remove: 'remove,debug',
		trigger: 'release'
});
```

### 问题反馈和建议

https://github.com/zswang/jdists/issues

## 开发

### 复制项目代码

`$ git clone https://github.com/zswang/jdists.git`

### 初始化依赖

`$ npm install`

### 执行测试用例

`$ npm test`

### 预处理

`$ npm run dist`

### 代码覆盖率

`$ npm run cover`

## 关键文件目录结果

```
[lib]                 --- 发布后的代码目录
		jdists.js         --- jdists 业务代码
		scope.js          --- jdists 作用域
[processor]           --- 预制编码器
[processor-extend]    --- 未预制的编码器，可能会常用的
[src]                 --- 开发期代码
[test]                --- 测试目录
		[fixtures]        --- 测试用例
		test.js           --- 测试调度文件
index.js              --- jdists 声明
cli.js                --- jdists 控制台
```

[1]: https://github.com/taptapship/wiredep
[2]: https://github.com/jshint/jshint
[3]: https://github.com/jsdoc3/jsdoc
[4]: https://github.com/douglascrockford/JSDev
[5]: https://github.com/cbml/cbml
