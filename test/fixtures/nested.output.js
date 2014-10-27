void function() {
console.log('start');
console.log('hello world!');

var render = jhtmls.render("\n<ul>\nforEach(function(item) {\n  \n  <li>#{item.title}</li>\n});\n<ul>\n");
console.log('end');
}();