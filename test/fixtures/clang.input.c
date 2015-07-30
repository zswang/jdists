#include<stdio.h>

int main(void)
{
	/*<jdists export="#encode">
	function (content) {
		return content.replace(/char\s+(\w+)\[\s*(\d+)\s*\]\s*=\s*"(.*?)"/,
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
	char _link[100] = "http://legend.baidu.com/";
	/*</jdists>*/

	printf("link: %s\n", _link);
	return 0;
}