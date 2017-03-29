/*<jdists encoding="templatestrings">*/
var s1 = `1
2
3
4`;

var s2 = `"1"
"2"
"3"
"4"`;

var s3 = `"\`1"
"\`2"
"\`3"
"\`4"`;

var s4 = `s1: ${s1} s2: ${s2} s3: ${s3} all: ${s1 + s2 + s3}`;
/*</jdists>*/