/*<jdists encoding="fndep" depend="c">*/

/*<function name="a">*/
function a() {
  console.log('a');
}
/*</function>*/

/*<function name="b">*/
function b() {
  console.log('b');
}
/*</function>*/

/*<function name="c" depend="a,b">*/
function c() {
  console.log('c');
}
/*</function>*/

/*<function name="d" depend="b">*/
function d() {
  console.log('d');
}
/*</function>*/

/*</jdists>*/