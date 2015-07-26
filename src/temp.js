/*<jdists encoding="glob" pattern="processor/*.js" />*/

/*<jdists encoding="jade" data='{"title":"囧"}'>*/
div
  div.title
    attr=title
/*</jdists>*/

/*<replace export="#title">*/first/*</replace>*/
/*<include import="?cctv"/>*/
/*<replace export="#title">*/second/*</replace>*/
/*<include import="?cctv"/>*/
/*<cctv>*/
hello /*<include import="#title"/>*/
/*</cctv>*/