/*<jdists encoding="fndep" depend="c">*/

/*<function name="a" depend="b">*/
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

//------------

/*<jdists encoding="fndep"></jdists>*/

/*<jdists encoding="fndep" depend="e">*/
  /*<function name="e" depend="e">*/
  function e() {
    console.log('e');
  }
  /*</function>*/
/*</jdists>*/

/*<jdists encoding="fndep" depend="f">*/
/*</jdists>*/