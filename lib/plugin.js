'use strict';

var _ = require('lodash');

/**
 * This is the main chai plugin. It installs all the assertion methods and
 * properties. They'll be locked in to the values installed here. But each
 * method installed here is dispatched through to methods in a separate file
 * which can be cleared from the require cache, allow resetting the module when
 * required.
 *
 * @public
 * @function plugin
 * @param {Object} chai
 * @param {Object} utils
 * @see reset
 */
module.exports = function(chai, utils) {

  // install all methods & properties
  _.forEach(require('./plugin_methods'), function(fn, name) {

    var Assertion = chai.Assertion;
    var via = fn.via || 'addMethod';

    Assertion[via](name, function() {
      // re-requiring here allows clearing of the require cache to invalidate
      // anything being required within plugin_methods. do not call fn
      // directly as the value will be locked in forever here.
      var methods = require('./plugin_methods'); // rst:delayed-require
      var method = methods[name];
      var args = [chai, utils].concat(_.toArray(arguments));
      return method.apply(this, args);
    });

  });

};
