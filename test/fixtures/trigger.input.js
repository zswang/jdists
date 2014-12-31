void function () {
  /*<replace trigger="LAN">
ajax.host = 'host://192.168.1.55:8000/getuser';
  </replace>*/
  /*<replace trigger="release">
ajax.host = 'host://api.baidu.com/getuser';
  </replace>*/
  /*<remove trigger="release,LAN">*/
ajax.host = 'host://localhost:8000/getuser';
  /*</remove>*/

  /*<remove trigger="release">*/
console.log('Informal version.');
  /*</remove>*/

  var a = 0;
  /*<number trigger="LAN">
  a += 10;
  </number>*/
  /*<number>
  a += 12;
  </number>*/
  /*<include block="number" />*/
}();