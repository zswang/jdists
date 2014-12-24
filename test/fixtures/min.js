define(function(require, exports) {

  exports.min = function() {
    return Math.min.apply(null, arguments);
  };

});