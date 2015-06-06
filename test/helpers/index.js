'use strict';

var chai = require('chai');

var createAdapter = require('../..').adapter;
var maguey = require('maguey');
var EntryQuery = maguey.EntryQuery;

chai.use(require('../..'));

global.expect = chai.expect;
global.should = chai.should();

global.__adapter = function(fn) {
  return function() {
    beforeEach(function() {
      global.adapter = createAdapter();
    });
    fn.call(this);
  };
};

global.__query = function(fn) {
  return __adapter(function() {
    beforeEach(function() {
      global.query = EntryQuery.create(global.adapter);
    });
    fn.call(this);
  });
};
