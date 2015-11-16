/*<function name="b">*/
function b() {
  console.log('b');
}
/*</function>*/
/*<function name="a" depend="b">*/
function a() {
  console.log('a');
}
/*</function>*/
/*<function name="c" depend="a,b">*/
function c() {
  console.log('c');
}
/*</function>*/
//------------
  /*<function name="e" depend="e">*/
  function e() {
    console.log('e');
  }
  /*</function>*/
