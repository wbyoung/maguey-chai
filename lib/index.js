'use strict';

var plugin = require('./plugin');
var wrapper = plugin.bind(plugin);

/**
 * Reset will cause any parts of this module that use maguey to re-import
 * maguey. This allows for use in scenarios where maguey is re-loaded by the
 * test runner.
 *
 * For instance, when using this to test maguey itself, mocha re-loads all of
 * maguey when tests are run in watch mode. If we did not reset things like
 * BaseQuery and Adapter that maguey-chai uses from maguey itself, there will
 * be inconsistencies in type checking both when values are given to this
 * module and type checked or when this module had produced values that are
 * type checked.
 *
 * Annotations have been left throughout the code in files where `require` is
 * delayed to respect resets. These are marked with `rst:delayed-require`
 * comments. Files that will need a reset because they use components from
 * maguey are marked with a `rst:affected` where the import occurs. These files
 * affect all files that require them as well (they're kind of like a virus).
 *
 * @public
 * @function reset
 */
wrapper.reset = function() {
  delete require.cache[require.resolve('./plugin_methods')];
  delete require.cache[require.resolve('./adapter')];
  return wrapper;
};

/**
 * Create a new fake adapter.
 *
 * Note that you'll get an instance of a new class after each {@link reset}.
 *
 * @public
 * @function adapter
 * @return {Adapter}
 */
wrapper.adapter = function() {
  var FakeAdapter = require('./adapter'); // rst:delayed-require
  return FakeAdapter.create.apply(FakeAdapter, arguments);
};

module.exports = wrapper;
