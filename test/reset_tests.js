'use strict';

require('./_helpers');

var _ = require('lodash');
var path = require('path');
var base = path.dirname(__dirname) + '/';
var magueyChai = require('..');

var startsWithBase = _.ary(_.partial(_.startsWith, _, base), 1);
var startsWithNodeModules =
  _.ary(_.partial(_.startsWith, _, 'node_modules'), 1);

var required = function() {
  return _(require.cache)
    .keys()
    .filter(startsWithBase)
    .invoke('substring', base.length)
    .filter(_.negate(startsWithNodeModules))
    .value();
};


describe('reset', function() {

  it('removes modules from cache', function() {
    required().should
    .contain('lib/adapter.js').and
    .contain('lib/adapter.js');

    magueyChai.reset();

    required().should
    .not.contain('lib/adapter.js').and
    .not.contain('lib/adapter.js');
  });

});
