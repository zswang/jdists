var path = require('path');
var jsets = require('jsets');
var cbml = require('cbml');
var fs = require('fs');

function create(options) {
  options = options || {};
  var instance = {};
  var filename = path.resolve('', options.filename || '');
  var tokens = cbml.parse(fs.readFileSync(filename));
 console.log(JSON.stringify(tokens, null, '  '));

  var argv = options.argv || {};
  var parent = options.parent || null;
  var scopes = options.scopes || {};
  var processors = options.processors || {};
  var variants = options.variants || {};
  scopes[filename] = instance;

  var getArgument = jsets.createGetter(instance, function (name) {
    return argv[name];
  }, true); 
  instance.getArgument = getArgument;

  var getVariant = jsets.createGetter(instance, function (name) {
    return variants[name];
  }, true);
  instance.getVariant = getVariant;

  var setVariant = jsets.createSetter(instance, function (name, value) {
    variants[name] = value;
  }, true);
  instance.setVariant = setVariant;

  instance.getParent = function () {
    return parent;
  };
  instance.getFilename = function () {
    return filename;
  };
  instance.getDirname = function () {
    return path.dirname(filename);
  };

  function parseAttr(expression) {
    if (expression.indexOf('#') === 0) { // variants
      return getVariant(expression.slice(1));
    }
    if (expression.indexOf('@') === 0) {
      return getArgument(expression.slice(1));
    }
    var items = expression.split('?');
    var filename = items[0] || filename;
    var search = items[1] || '';
  }

  function getScope(filename) {
    var result = scopes[filename];
    if (!result) {
      result = create({
        argv: argv,
        parent: instance,
        scopes: scopes,
        processors: processors,
        variants: variants
      });
    }
    return result;
  }

  instance.parseAttr = parseAttr;

  function complie(content, encoding) {

  }

  instance.complie = complie;

  function buildNode(node, options) {
    var result = '';
    if (!node) {
      return result;
    }
    if (node.completed) {
      return node.value;
    }
    if (node.type === 'text') {
      return node.value;
    }

    if (node.type === 'cbml') {
      node.nodes.forEach(function(node) {
        result += buildNode(node);
      });
    } else if (node.tag === 'jdists') {
      console.log(node.content);
      var tokens = cbml.parse(node.content);
      result = buildNode(tokens);
      // TODO encoding
      if (node.attrs.encoding === 'base64') {
        result = (new Buffer(result)).toString('base64')
      } else if (node.attrs.encoding === 'string') {
        result = JSON.stringify(result);
      }
    }

    node.completed = true;
    node.value = result;
    return result;
  }

  function build() {
    if (tokens.completed) {
      return tokens.value;
    }

    return buildNode(tokens);
  }
  instance.build = build;

  return instance;
}

exports.create = create;