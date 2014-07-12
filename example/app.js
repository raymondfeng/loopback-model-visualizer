var fs = require('fs');
var path = require('path');
var index = require('../lib/index');
var viz = index.ModelVisualizer;

var loopback = require('loopback');
var ds = loopback.memory();
loopback.setDefaultDataSourceForType('db', ds);
loopback.setDefaultDataSourceForType('mail', loopback.createDataSource({connector: 'mail'}));
loopback.autoAttach();

var options = {
  excludingNulls: true,
  format: 'svg'
};

var models = [];
var modelReg = loopback.Model.modelBuilder.models;
for (var m in modelReg) {
  if(m.indexOf('AnonymousModel_') === 0) {
    continue;
  }
  models.push(modelReg[m]);
}
console.log('Rendering diagrams ...');

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



