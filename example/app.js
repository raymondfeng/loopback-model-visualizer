var fs = require('fs');
var path = require('path');
var index = require('../lib/index');
var viz = index.VizVisualizer;

var loopbackData = require('loopback-data');
var DataSource = loopbackData.DataSource;
var ds = new DataSource('memory');

// define models
var Post = ds.define('Post', {
    title: { type: String, length: 255 },
    content: { type: DataSource.Text },
    date: { type: Date, default: function () {
        return new Date;
    } },
    timestamp: { type: Number, default: Date.now },
    published: { type: Boolean, default: false, index: true }
});

var UserSchema = {
    name: String,
    bio: DataSource.Text,
    approved: Boolean,
    joinedAt: Date,
    age: Number
};

var User = ds.define('User', UserSchema);

// setup relationships
User.hasMany(Post, {as: 'posts', foreignKey: 'userId'});

var user = new User({name: 'Joe', age: 30, joinedAt: new Date()});

// console.log(ds.models);
// console.log(ds.definitions);

var options = {
    builtins: false,
    allFunctions: false,
    excludingNulls: true,
    format: 'svg'
};

console.log('Rendering diagrams ...');

var schemaSvg = viz.render('UserSchema', UserSchema, options);

fs.writeFile(path.join(__dirname, 'user-schema.svg'), schemaSvg, function (err) {
    if (err) throw err;
    console.log('user-schema.svg is saved to ' + __dirname);
});

var clsSvg = viz.render('User', User, options);

fs.writeFile(path.join(__dirname, 'user-class.svg'), clsSvg, function (err) {
    if (err) throw err;
    console.log('user-class.svg is saved to ' + __dirname);
});

var objSvg = viz.render('User', user, options);

fs.writeFile(path.join(__dirname, 'user-object.svg'), objSvg, function (err) {
    if (err) throw err;
    console.log('user-object.svg is saved to ' + __dirname);
});

var clsGraph = viz.renderGraph('User', User, options);

fs.writeFile(path.join(__dirname, 'user-class.dot'), clsGraph, function (err) {
    if (err) throw err;
    console.log('user-class.dot is saved to ' + __dirname);
});



