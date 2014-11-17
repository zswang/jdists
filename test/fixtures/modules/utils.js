define(function(require, exports) {

  function format(template, data) {
    return String(template).replace(/#\{([\w-]+)\}/, function(all, key) {
      return data[key] || '';
    });
  }

  exports.format = format;

});