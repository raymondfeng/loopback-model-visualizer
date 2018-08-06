# Loopback Data Model Visualizer

The Loopback Data Model visualizer generates DOT or SVG diagrams from model definitions using
[graphviz](http://www.graphviz.org/). 

## To render models to graphviz diagrams such as DOT or SVG.

```js
var options = {
  excludingNulls: true,
  format: 'svg',
  excludeInstanceMethods: false,
  excludeStaticMethods: false
}

var schemaSvg = viz.render('Models', models, options);

fs.writeFile(path.join(__dirname, 'loopback-models.svg'), schemaSvg, function (err) {
  if (err) {
    throw err;
  }
  console.log('loopback-models.svg is saved to ' + __dirname);
});

var clsGraph = viz.renderGraph('Models', models, options);

fs.writeFile(path.join(__dirname, 'loopback-models.dot'), clsGraph, function (err) {
  if (err) {
    throw err;
  }
  console.log('loopback-models.dot is saved to ' + __dirname);
});
```

To run samples:

`node example/app`

You will find the following diagrams generated:

* loopback-models.svg (open with browsers such as Chrome)
* loopback-models.dot (open with graphviz)


### Options

#### Filters
* excludingNulls: Excluding null/undefined properties
* format: Diagram format
* excludeInstanceMethods: Exclude instance methods from graph model listings
* excludeStaticMethods: Exclude static methods from graph model listings

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

