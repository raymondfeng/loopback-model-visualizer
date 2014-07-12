"use strict";

var ModelNode = require('./model_node');

module.exports = ModelGraph;

function ModelGraph(name, models, options) {
  var self = this;
  options = options || {};

  this._name = name;
  this._nodes = [];
  this._edges = [];

  // This algorithm is O(n^2) because hasNode is O(n). :-(
  // It will be much faster when we can replace this._nodes with Set, which should be O(1).
  // (Set is a new data type coming in a future version of JavaScript.)
  // var start = Date.now();
  if (Array.isArray(models)) {
    models.forEach(function (m) {
      self.traverse(new ModelNode(m));
    });
  } else {
    this.traverse(new ModelNode(models));
  }
  this.removePartialEdges(this);
  // console.log('Duration for traversing the graph: %d ms', (Date.now() - start));
}

ModelGraph.prototype.toJSON = function () {
  return {
    name: this._name,
    nodes: this._nodes.map(function (n) {
      return n.toJSON();
    }),
    edges: this._edges.map(function (e) {
      return {
        from: e.from.id(),
        to: e.to.id(),
        fromField: e.fromField
      };
    })
  };
};

ModelGraph.prototype.nodes = function nodes() {
  return this._nodes;
};

ModelGraph.prototype.edges = function edges() {
  return this._edges;
};

ModelGraph.prototype.traverse = function traverse(node) {
  var self = this;
  if (self.hasNode(node)) {
    return;
  }

  self.addNode(node);
  node.forEachSubNode(function (subnode, id, toId, options) {

    subnode = self.dedupe(subnode);
    self.addEdge(node, subnode, id, toId, options);
    self.traverse(subnode);
  });
}

ModelGraph.prototype.removePartialEdges = function () {
  var self = this;
  // When traversing, we add edges for some subnodes that are not traversed. This is necessary
  // because the decision of which subnode to traverse is context-dependent, so sometimes we'll
  // decide to filter out a subnode that's later included. We add an edge regardless so it will be present
  // if the node is later included. If the node never was included, we filter it out here.

  var result = [];
  self._edges.forEach(function (element) {
    // We're going to figure out if the 'to' node is present, and if it is, we'll use the one that's in
    // _nodes rather than the one stored in the edge. That's because the edge may refer to a node that
    // was filtered out, if the edge found before the node was known to be interesting.
    // Note: It's impossible for the 'from' node to be missing due to the way the traversal algorithm works.

    // This code a more complicated way of saying (paraphrased) "if (hasNode()) dedupe();". It's a bit faster.
    var node = self.findNode(element.to);
    if (node !== undefined) {
      element.to = node;
      result.push(element);
    }
  });
  self._edges = result;
}

ModelGraph.prototype.hasNode = function (node) {
  return this.findNode(node) !== undefined;
}

ModelGraph.prototype.dedupe = function (node) {
  return this.findNode(node) || node;
}

ModelGraph.prototype.findNode = function (node) {
  // Use for loop to return fast for the 1st hit
  var self = this;
  var size = self._nodes.length;
  for (var i = 0; i < size; i++) {
    if (self._nodes[i].equals(node)) {
      return self._nodes[i];
    }
  }
  return undefined;
}

ModelGraph.prototype.addNode = function (node) {
  this._nodes.push(node);
}

ModelGraph.prototype.addEdge = function (from, to, fromField, toField, options) {
  this._edges.push({
    from: from,
    to: to,
    fromField: fromField,
    toField: toField || 'title',
    options: options || {}
  });
}
