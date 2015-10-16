var jdists = require('../.');

console.log(
  jdists.build('/*<jdists encoding="ejs" data="#hook"><%- name%></jdists>*/', {
    fromString: true
  }, function (scope) {
    scope.setVariant('hook', {
      name: 123,
      title: 'hello'
    });
  })
);