// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global Viz */


// Functions for turning an object graph into SVG.

"use strict";

var ObjectGraph = require('./object_graph');
var Viz = require('./viz/viz.js').Viz;

module.exports = VizVisualizer;

function VizVisualizer(options) {
    options = options || {};
    this.ARROW_COLOR = options.ARROW_COLOR || "#555555";
    this.ARROW_HEAD_MULTIPLIER = options.ARROW_HEAD_MULTIPLIER || "0.8";

    this.TABLE_FONT_POINTS = options.TABLE_FONT_POINTS || 10;

    this.TITLE_BACKGROUND_COLOR = options.TITLE_BACKGROUND_COLOR || "#00668F";
    this.TITLE_FONT_COLOR = options.TITLE_FONT_COLOR || "white";
    this.TITLE_FONT_POINTS = options.TITLE_FONT_POINTS || (this.TABLE_FONT_POINTS + 1);

    this.PROPERTY_BACKGROUND_COLOR = options.PROPERTY_BACKGROUND_COLOR || "#E3E3E3";
    this.PROPERTY_ALT_BACKGROUND_COLOR = options.PROPERTY_ALT_BACKGROUND_COLOR || "#FDFDFD";
    this.PROPERTY_NAME_FONT_COLOR = options.PROPERTY_NAME_FONT_COLOR || "#333333";
    this.PROPERTY_VALUE_FONT_COLOR = options.PROPERTY_VALUE_FONT_COLOR || "#666666";

    this.PROTOTYPE_BACKGROUND_COLOR = options.PROTOTYPE_BACKGROUND_COLOR || "#0082B6";
    this.PROTOTYPE_FONT_COLOR = options.PROTOTYPE_FONT_COLOR || "white";
}

VizVisualizer.render = function render(rootName, object, options) {
    var visualizer = new VizVisualizer(options);
    var graph = new ObjectGraph(rootName, object, options);
    var viz = visualizer.graphToViz(graph);
    return visualizer.vizToSvg(viz);
};

VizVisualizer.prototype.renderViz = function vizToSvg(vizCode, format) {
    var w = process.stdout.write;
    var out = "";
    process.stdout.write = function (data) {
        out += data;
    }
    /*jshint newcap:false */
    Viz(vizCode, format || "svg");
    process.stdout.write = w;
    return out;
};

VizVisualizer.prototype.vizToSvg = function vizToSvg(vizCode) {
    return this.renderViz(vizCode, 'svg');
};

VizVisualizer.prototype.graphToViz = function graphToViz(graph) {
    var self = this;
    return '' +
        'digraph g {\n' +
        '  graph [\n' +
        '    rankdir = "LR"\n' +
        '  ];\n' +
        '  node [\n' +
        '    fontname = "Helvetica"\n' +
        '    fontsize = "' + self.TABLE_FONT_POINTS + '"\n' +
        '    shape = "plaintext"\n' +   // 'plaintext' is misnamed; it enables HTML-like formatting
        '  ];\n' +
        '  edge [\n' +
        '    color = "' + self.ARROW_COLOR + '"\n' +
        '    arrowsize = "' + self.ARROW_HEAD_MULTIPLIER + '"\n' +
        '  ];\n' +
        '  \n' +
        nodes() +
        edges() +
        '}\n';

    function nodes() {
        return graph.nodes().map(function (node) {
            return self.nodeToViz(node);
        }).join("");
    }

    function edges() {
        return graph.edges().map(function (edge) {
            return self.edgeToViz(edge);
        }).join("");
    }
};

VizVisualizer.prototype.nodeToViz = function nodeToViz(node) {
    var self = this;
    return '' +
        '  "' + node.id() + '" [label=<\n' +
        '    <table border="0" cellborder="0" cellpadding="3" cellspacing="0">\n' +
        '      <th><td port="title" bgcolor="' +
        self.TITLE_BACKGROUND_COLOR + '"><font color="' + self.TITLE_FONT_COLOR + '" point-size="' +
        self.TITLE_FONT_POINTS + '">' + self.escapeHtml(node.name()) + '</font></td></th>\n' +
        fields() +
        prototype() +
        '    </table>\n' +
        '  >];\n';

    function fields() {
        var oddRow = true;
        return node.properties().map(function (property) {
            var color = oddRow ? self.PROPERTY_BACKGROUND_COLOR : self.PROPERTY_ALT_BACKGROUND_COLOR;
            oddRow = !oddRow;
            var result = '      <tr><td port="' + property.id + '" bgcolor="' + color +
                '" align="left" balign="left">&nbsp;<font color="' +
                self.PROPERTY_NAME_FONT_COLOR + '">' + self.escapeHtml(property.name) + ':</font> <font color="' +
                self.PROPERTY_VALUE_FONT_COLOR + '">' + self.escapeHtml(property.value) + '</font>&nbsp;</td></tr>\n';
            return result;
        }).join("");
    }

    function prototype() {
        var proto = node.prototype();
        return '      <tr><td port="' + proto.id + '" bgcolor="' +
            self.PROTOTYPE_BACKGROUND_COLOR + '"><font color="' + self.PROTOTYPE_FONT_COLOR + '">' +
            self.escapeHtml(proto.value) + '</font></td></tr>\n';
    }
};

VizVisualizer.prototype.edgeToViz = function edgeToViz(edge) {
    return '"' + edge.from.id() + '":' + edge.fromField + ' -> "' + edge.to.id() + '":title [];';
};

VizVisualizer.prototype.escapeHtml = function escapeHtml(html) {
    return html.
        replace(/&/g, "&amp;").
        replace(/</g, "&lt;").
        replace(/>/g, "&gt;").
        replace(/"/g, "&quot;").
        replace(/'/g, "&#039;").
        replace(/\n/g, '<br />').
        replace(/\t/g, '  ');
};


