void function () {
  /*<replace trigger="LAN"
ajax.host = 'host://192.168.1.55:8000/getuser';
  /replace>*/
ajax.host = 'host://api.baidu.com/getuser';
  var a = 0;
  /*<number trigger="LAN"
  a += 10;
  /number>*/
  /*<number
  a += 12;
  /number>*/
  a += 12;
}();