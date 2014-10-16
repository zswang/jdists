# jdists(<>)

[![Build Status](https://img.shields.io/travis/zswang/jdists/master.svg)](https://travis-ci.org/zswang/jdists)
[![NPM version](https://img.shields.io/npm/v/jdists.svg)](http://badge.fury.io/js/jdists)

## 背景

一般的项目会在多个地方进行发布，比如线上环境、内网环境、本地环境，除了配置以外。我们还希望能将特定的代码区块裁剪掉或嵌套。
jdists 为你提供一个简单的代码块处理工具。

## 定义

### js 区域定义

```javascript
/*<debug>*/
console.log(debug);
/*</debug>*/
```

### css 区域定义

```css
#panel {
/*<debug>*/
  background-color: red;
/*</debug>*/
}
```

### html 区域定义

```html
<!--debug-->
<span>测试版本，请勿对外公开</span>
<!--/debug-->

```

### 函数注释字符 区域定义

```js
function() {/*!
<div>
  <a href="#{url}">#{title}</a>
  <button>cancel</button><button>download</button>
</div>
  */}
```

## 使用

* 安装 `$npm install jdists -g`
* 命令 `$jdists input1 [input2] -output output -remove debug,test
* 示例 `$jdists src/index.js -o dist/index.js -r debug,test`
