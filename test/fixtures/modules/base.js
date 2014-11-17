define(function(require, exports) {

  var utils = require('utils');

  exports.log = function() {
    console.log(utils.format('#{name}', {
      name: 'zswang'
    }));
  };

});