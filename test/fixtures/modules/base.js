define(function(require, exports) {

  var utils = require('utils');
  var min = require('../min').min;

  exports.log = function() {
    console.log(utils.format('#{name}', {
      name: 'zswang'
    }));
    console.log('min:', min(1, 2, 0));
  };

});