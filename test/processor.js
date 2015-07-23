var jdistsScope = require('../src/scope');

var scope = jdistsScope.create({
	filename: 'src/temp.js'
});

console.log(scope.build());