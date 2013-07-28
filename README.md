# Loopback Data Model Visualizer

The Loopback Data Model visualizer generates SVG diagrams from model definitions using
[graphviz](http://www.graphviz.org/). It is forked from [object_playground](https://github.com/jamesshore/object_playground).

## To render an object to graphviz diagrams such as DOT or SVG.

        var fs = require('fs');
        var path = require('path');
        var viz = require('loopback-data-visualizer');

        var options = {
            builtins: false,
            allFunctions: false
            builtins: false,
            excludingNulls: true,
            format: 'svg'
        };

        var svg = viz.render('User', User, options);

        fs.writeFile(path.join(__dirname, 'user-class.svg'), svg, function (err) {
            if (err) throw err;
            console.log('user-class.svg is saved to ' + __dirname);
        });

To run samples:

`node example/app`

You will find the following diagrams generated:

* user-class.svg (open with browsers such as Chrome)
* user-class.dot (open with graphviz)
* user-object.svg


### Options

#### Filters
* builtins: Including builtin types
* allFunctions: Including all functions
* excludingNulls: Excluding null/undefined properties
* format: Diagram format

#### Diagram settings
* ARROW_COLOR
* ARROW_HEAD_MULTIPLIER
* TABLE_FONT_POINTS
* TITLE_BACKGROUND_COLOR
* TITLE_FONT_COLOR
* TITLE_FONT_POINTS
* PROPERTY_BACKGROUND_COLOR
* PROPERTY_ALT_BACKGROUND_COLOR
* PROPERTY_NAME_FONT_COLOR
* PROPERTY_VALUE_FONT_COLOR
* PROTOTYPE_BACKGROUND_COLOR
* PROTOTYPE_FONT_COLOR

## Test
run `npm test`

