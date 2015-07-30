#include<stdio.h>
int main(void)
{
	char _link[100];
	_link[0]='h';
	_link[1]='t';
	_link[2]='t';
	_link[3]='p';
	_link[4]=':';
	_link[5]='/';
	_link[6]='/';
	_link[7]='l';
	_link[8]='e';
	_link[9]='g';
	_link[10]='e';
	_link[11]='n';
	_link[12]='d';
	_link[13]='.';
	_link[14]='b';
	_link[15]='a';
	_link[16]='i';
	_link[17]='d';
	_link[18]='u';
	_link[19]='.';
	_link[20]='c';
	_link[21]='o';
	_link[22]='m';
	_link[23]='/';
	_link[24]='\0';
	printf("link: %s\n", _link);
	return 0;
}