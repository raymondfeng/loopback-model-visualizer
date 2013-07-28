// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.

// Instances catalog all objects reachable from a root object.
"use strict";

var ObjectNode = require('./object_node');

module.exports = ObjectGraph;

function ObjectGraph(name, root, options) {
    options = options || {};

    this._name = name;
    this._nodes = [];
    this._edges = [];
    this._showBuiltins = !!options.builtins;
    this._showAllFunctions = !!options.allFunctions;

    // This algorithm is O(n^2) because hasNode is O(n). :-(
    // It will be much faster when we can replace this._nodes with Set, which should be O(1).
    // (Set is a new data type coming in a future version of JavaScript.)
    this.traverse(new ObjectNode(name, root));
    this.removePartialEdges(this);
};

ObjectGraph.prototype.nodes = function nodes() {
    return this._nodes;
};

ObjectGraph.prototype.edges = function edges() {
    return this._edges;
};

ObjectGraph.prototype.traverse = function traverse(node) {
    var self = this;
    if (self.hasNode(node)) return;

    self.addNode(node);
    node.forEachSubNode(function (subnode, id, name) {
        if (self.isBuiltin(subnode) && !self._showBuiltins) return;

        subnode = self.dedupe(subnode);
        self.addEdge(node, subnode, id);
        if (self.isOrdinaryFunction(subnode, name) && !self._showAllFunctions) return;
        self.traverse(subnode);
    });
}

ObjectGraph.prototype.removePartialEdges = function() {
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

ObjectGraph.prototype.hasNode = function (node) {
    return this.findNode(node) !== undefined;
}

ObjectGraph.prototype.dedupe = function(node) {
    return this.findNode(node) || node;
}

ObjectGraph.prototype.findNode = function(node) {
    var self = this;
    var matchingNodes = self._nodes.filter(function (element) {
        return element.equals(node);
    });
    if (matchingNodes.length > 1) throw new Error("Node [" + node.name() + "] was stored multiple times; that should be impossible");
    return matchingNodes[0];
}

ObjectGraph.prototype.addNode = function(node) {
    this._nodes.push(node);
}

ObjectGraph.prototype.addEdge = function(from, to, fromField) {
    this._edges.push({
        from: from,
        to: to,
        fromField: fromField
    });
}

ObjectGraph.prototype.isBuiltin = function(node) {
    if(node._name.indexOf('._') !== -1) {
        // Ignore private properties
        return true;
    }
    var value = node.value();
    return value === Object.prototype ||
        value === Function.prototype ||
        value === Array.prototype ||
        value === String.prototype ||
        value === Boolean.prototype ||
        value === Number.prototype ||
        value === Date.prototype ||
        value === RegExp.prototype ||
        value === Error.prototype ||
        value === Buffer.prototype ||

        value === Object ||
        value === Function ||
        value === Array ||
        value === String ||
        value === Boolean ||
        value === Number ||
        value === Date ||
        value === RegExp ||
        value === Error ||
        value === Buffer;
}

ObjectGraph.prototype.isOrdinaryFunction = function(node, propertyName) {
    var func = node.value();
    if (typeof func !== "function") return false;

    var prototype = func.prototype;
    if (prototype && typeof prototype !== "object") return false;

    var constructor = propertyName === "constructor";
    var standardFunction = !hasUnusualProperties(func, ["length", "name", "caller", "arguments", "prototype"]);
    var standardPrototype = !hasUnusualProperties(prototype, ["constructor"]);
    var selfReferencingPrototype = !prototype || prototype.constructor === func;

    return !constructor && standardFunction && standardPrototype && selfReferencingPrototype;

    function hasUnusualProperties(obj, normalProperties) {
        if (obj === undefined || obj === null) return false;

        var unusualProperties = Object.getOwnPropertyNames(obj).filter(function (property) {
            return normalProperties.indexOf(property) === -1;
        });
        return (unusualProperties.length !== 0);
    }
}

