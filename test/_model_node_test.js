// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.


(function() {
    "use strict";
    var jdls = require('../lib/index');
    var expect = require('expect.js');

    describe("ModelNode", function() {

        function newNode(options) {
            return new jdls.ModelNode(TestModel, options);
        }

        function TestModel () {
        }

        TestModel.prototype.display = function () {
            return "tester!"
        }
        TestModel.super_ = { prototype: {} }
        TestModel.everythingStatic = function () {
            return "bzzzzzt"
        }

        TestModel.definition = {
            properties: {
                "name": {
                    "type": "string"
                },
                "category": {
                    "type": "number"
                }
            }
        }


        describe("properties", function() {
            function properties(options) {
                var node = newNode(options);
                return node.properties();
            }

            it("provides only properties with excludeInstanceMethods true and excludeStaticMethods true", function() {
                var options = {excludeInstanceMethods: true, excludeStaticMethods: true}

                var subject = properties(options)

                expect(subject.length).to.eql(2)
                expect(subject[0].name).to.eql("name");
                expect(subject[0].value).to.eql('{"type":"string"}');
                expect(subject[0].id).to.eql("property_name");
                expect(subject[1].name).to.eql("category");
                expect(subject[1].value).to.eql('{"type":"number"}');
                expect(subject[1].id).to.eql("property_category");
            });

            it("provides instance methods with excludeInstanceMethods false", function() {
                var options = {excludeInstanceMethods: false, excludeStaticMethods: true}

                var subject = properties(options)

                expect(subject.length).to.eql(3)
                expect(subject[0].name).to.eql("name");
                expect(subject[1].name).to.eql("category");
                expect(subject[2].name).to.eql("- display");
            });

            it("provides static with excludeStaticMethods false", function() {
                var options = {excludeInstanceMethods: true, excludeStaticMethods: false}

                var subject = properties(options)

                expect(subject.length).to.eql(3)
                expect(subject[0].name).to.eql("name");
                expect(subject[1].name).to.eql("category");
                expect(subject[2].name).to.eql("+ everythingStatic");
            });

            it("provides instance and static methods with excludeInstanceMethods false and excludeStaticMethods false", function() {
                var options = {excludeInstanceMethods: false, excludeStaticMethods: false}

                var subject = properties(options)

                expect(subject.length).to.eql(4)
                expect(subject[0].name).to.eql("name");
                expect(subject[1].name).to.eql("category");
                expect(subject[2].name).to.eql("- display");
                expect(subject[3].name).to.eql("+ everythingStatic");
            });
        });
    });
}());