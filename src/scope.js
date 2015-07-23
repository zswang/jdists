var path = require('path');
var jsets = require('jsets');

function Scope(options) {
  var filename = options.filename;
  var parent = options.parent;
  var variants = options.variants || {};
  var argv = options.argv || {};
  this.getArgument = jsets.createGetter(this, function (name) {
    return argv[name];
  }, true);
  this.getVariant = jsets.createGetter(this, function (name) {
    return variants[name];
  }, true);
  this.setVariant = jsets.createSetter(this, function (name, value) {
    variants[name] = value;
  }, true);
  this.getFilename = function () {
    return filename;
  };
  this.getDirname = function () {
    return path.dirname(filename);
  };
}

Scope.prototype.getAttr = function (expression) {
  if (expression.indexOf('#') === 0) { // variants
    return this.getVariant(expression.slice(1));
  }
  if (expression.indexOf('@') === 0) {
    return this.getArgument(expression.slice(1));
  }
};

Scope.prototype.complie = function (content) {

};