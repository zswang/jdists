var jdistsScope = require('../src/scope');

var scope = jdistsScope.create({
	filename: 'src/index.js',
  argv: {
    input: 'src/index.js',
    clean: true
  },
  clean: true,
  removes: 'remove',
  tags: {
    jdists: {
      encoding: 'original'
    },
    include: {
      encoding: 'original'
    },
    replace: {
      encoding: 'original'
    },
    ejs: {
      encoding: 'ejs'
    }
  }
});

console.log(scope.build());