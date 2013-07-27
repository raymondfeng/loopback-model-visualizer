# Loopback Data Model Visualizer

The Loopback Data Model visualizer generates SVG diagrams from model definitions using
[graphviz)(http://www.graphviz.org/). It is forked from [object_playground](https://github.com/jamesshore/object_playground).

## To render an object to svg

        var viz = require('loopback-data-visualizer')
        var options = {
            builtins: false,
            allFunctions: false
        };

        var svg = viz.render('User', user, options);
