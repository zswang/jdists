void
function() {
  var Sizzle;
  var define = function(require) {
    Sizzle = require();
  };
  define.amd = true;

  /*<include file="sizzle.js"/>*/

  function createStyle(css) {
    var style;
    if (document.createStyleSheet) {
      style = document.createStyleSheet();
    } else {
      style = document.createElement('style');
      document.getElementsByTagName('head')[0].appendChild(style);
    }
    css && updateStyle(style, css);
    return style;
  }

  function updateStyle(style, css) {
    if (!style) return;
    if (document.createStyleSheet) {
      style.cssText = css;
    } else {
      var textNode = style.firstChild;
      if (!textNode) {
        textNode = document.createTextNode(css);
        style.appendChild(textNode);
      } else {
        textNode.nodeValue = css;
      }
    }
  }

  /*<remove>*/
  var panel_html = '';
  var panel_style = '';
  /*</remove>*/

  /*<replace
  var panel_html = <!--include file="dev.html" block="html" encoding="string"/-->;
  var panel_style = <!--include file="dev.html" block="css" encoding="string"/-->;
  /replace>*/

  var div = document.createElement('div');
  div.innerHTML = panel_html;
  document.body.appendChild(div);
  createStyle(panel_style);

  /*<include file="dev.html" block="js"/>*/
}();