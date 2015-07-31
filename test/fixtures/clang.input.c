#include<stdio.h>

int main(void)
{
	/*<jdists export="#encode">
	function (content) {
		return content.replace(/char\s+(\w+)\[\s*(\d+)\s*\]\s*=\s*"(.*?)"/g,
			function (all, name, len, value) {
				var items = value.split('').concat([0]);
				items = items.map(function (item, index) {
					var value = item === 0 ? "'\\0'" : "'" + item + "'";
					return '\t' + name + '[' + index + ']=' + value;
				});
				return 'char ' + name + '[' + len + '];\n' + items.join(';\n');
			}
		);
	}
	</jdists>*/
	/*<jdists encoding="#encode">*/
	char _link1[100] = "http://legend.baidu.com/";
	char _link2[100] = "http://shushuo.baidu.com/";
	/*</jdists>*/

	printf("link1: %s\n link2", _link2, _link2);
	return 0;
}