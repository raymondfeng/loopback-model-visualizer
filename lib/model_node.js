'use strict';

var loopback = require('loopback');

module.exports = ModelNode;

function ModelNode(model) {
  if (typeof model !== 'function') {
    throw new Error('Invalid ModelNode value: ' + model);
  }

  this._name = model.modelName;
  this._value = model;
}

ModelNode.prototype.toJSON = function () {
  return {
    id: this.id(),
    name: this.name(),
    value: describeField(this.value()),
    properties: this.properties()
  };
};

ModelNode.prototype.id = function id() {
  return 'model_' + this._name;
};

ModelNode.prototype.name = function name() {
  return this._name;
};

ModelNode.prototype.type = function type() {
  return this._name;
};

ModelNode.prototype.value = function value() {
  return this._value;
};

ModelNode.prototype.properties = function properties() {
  var self = this;
  if (!self._value.definition) {
    return [];
  }
  var props = self._value.definition.properties;
  var names = Object.keys(props);
  var propertyDescriptors = names.map(function (name) {
    return {
      name: name,
      value: describeField(props[name]),
      id: 'property_' + name
    };
  });

  var instanceMethods = Object.keys(this._value.prototype);
  var superInstanceMethods = Object.keys(this._value.super_.prototype).concat(Object.keys(loopback.DataModel.prototype));

  var instanceMethodDescriptors = [];
  instanceMethods.forEach(function (name) {
    if (name.indexOf('_') !== 0 && superInstanceMethods.indexOf(name) === -1
      && typeof self._value.prototype[name] === 'function') {
      instanceMethodDescriptors.push({
        name: '- ' + name,
        value: name + '()',
        id: 'method_prototype_' + name
      });
    }
  });

  var staticMethods = Object.keys(this._value);
  var superStaticMethods = Object.keys(this._value.super_).concat(Object.keys(loopback.DataModel));

  var staticMethodDescriptors = [];
  staticMethods.forEach(function (name) {
    if (name.indexOf('_') !== 0 && superStaticMethods.indexOf(name) === -1) {
      var isFunc = typeof self._value[name] === 'function';
      staticMethodDescriptors.push({
        name: '+ ' + name,
        value: name + (isFunc ? '()' : ''),
        id: 'method_' + name
      });
    }
  });

  return propertyDescriptors.concat(instanceMethodDescriptors).concat(staticMethodDescriptors);
};

ModelNode.prototype.forEachSubNode = function forEachSubNode(fn) {
  var self = this;
  var relations = self._value.relations;
  for (var r in relations) {
    var rel = relations[r];
    var edge = {
      label: rel.type,
      headlabel: rel.name
    };
    fn(new ModelNode(rel.modelTo), 'property_' + rel.keyFrom, 'property_' + rel.keyTo, edge);
  }

  var base = self._value.super_;
  if (base.modelName) {
    fn(new ModelNode(base), 'title', 'title', {arrowhead: 'onormal', color: 'blue'});
  }
};

ModelNode.prototype.equals = function equals(node) {
  return this._value === node._value;
};

function describeField(prop) {
  var p = {};
  for (var i in prop) {
    p[i] = prop[i];
    if (typeof p[i] === 'function') {
      p[i] = p[i].modelName || p[i].name;
    }
  }
  return JSON.stringify(p);
}

ModelNode.prototype.prototype = function () {
  var base = this._value.super_;
  var name = base.modelName || base.name;
  return {
    id: 'model_' + name,
    value: name
  };
};



