console.log('hello world!');

var render = jhtmls.render(function() {
/*!
<ul>
forEach(function(item) {
  <!--remove-->
  <label>不会出现</label>
  <!--/remove-->
  <li>#{item.title}</li>
});
<ul>
*/
});