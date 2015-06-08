'use strict';

var _ = require('lodash');
var util = require('util');
var maguey = require('./').__maguey || require('maguey'); // reset-annotation
var BaseQuery = maguey.BaseQuery;
var AdapterSpy = require('./adapter_spy');
var Class = require('corazon/class');

/**
 * Format a SQL & arg pair.
 *
 * @param {Array} pair
 * @return {String}
 */
var formatPair = function(pair) {
  return util.format('%s ~[%s]', pair[0], pair[1].join(', '));
};

/**
 * Check that a query matches expected SQL and args.
 *
 *   .should.be.a.query('SELECT 1')
 *   .should.be.a.query('SELECT ?', [1])
 *
 * @public
 * @function query
 * @param {...String|Array} pairs
 */
exports.query = function(chai, utils, sql, args) {
  var Assertion = chai.Assertion;
  new Assertion(this._obj).to.be.instanceof(BaseQuery.__class__);
  var pass =
    utils.eql(sql, this._obj.sql) &&
    utils.eql(args || [], this._obj.args);
  this.assert(pass,
    'expected #{this} to have SQL #{exp} but got #{act}',
    'expected #{this} to not have SQL of #{act}',
    formatPair([sql, args || []]),
    formatPair([this._obj.sql, this._obj.args]));
};

/**
 * Create tuples from input arguments. The arguments form a list of tuples, but
 * may omit the args (the second value in the tuple) in which case it is
 * assumed to be an empty argument list, `[]`.
 *
 * @param {Array} args
 * @return {Array.<SQLTuple>}
 */
var createTuples = function(args) {
  if (_.every(args, _.isArray)) {
    args = _.flatten(args);
  }
  return _.transform(args, function(result, item, i, obj) {
    var itemArgs = obj[i + 1];
    if (!_.isArray(itemArgs)) { itemArgs = []; }
    if (!_.isArray(item)) {
      result.push([item, itemArgs]);
    }
  }, []);
};

/**
 * Test an expected SQL value against an actual (executed) value.
 *
 * @param {String|RegExp} expected
 * @param {String} actual
 * @return {Boolean}
 */
var sqlEqual = function(expected, actual) {
  return ((expected instanceof RegExp) && expected.test(actual)) ||
    _.eq(expected, actual);
};

/**
 * Test an expected SQL argument list against an actual (executed) argument
 * list.
 *
 * @param {Array} expected
 * @param {Array} actual
 * @return {Boolean}
 */
var argsEqual = function(expected, actual) {
  return _.eq(expected, actual);
};

/**
 * An array of length two where the first value represents the SQL and the
 * second represents the arguments used during execution of the SQL statement.
 *
 * When representing an expected value, the first value, the SQL value, can be
 * a regular expression.
 *
 * @typedef {Array} SQLTuple
 */

/**
 * Test an expected SQL/arg tuple against an actual (executed) tuple.
 *
 * @private
 * @function
 * @param {SQLTuple} expected
 * @param {SQLTuple} actual
 * @return {Boolean}
 */
var tupleEqual = function(expected, actual) {
  return expected && actual &&
    sqlEqual(expected[0], actual[0]) &&
    argsEqual(expected[1], actual[1]);
};

/**
 * Test an array of expected SQL/arg tuples against actual (executed) tuples.
 *
 * @private
 * @function
 * @param {Array.<SQLTuple>} expected
 * @param {Array.<SQLTuple>} actual
 * @return {Boolean}
 */
var tuplesEqual = function(expected, actual) {
  var zipped = _.zip(expected, actual);
  return _.every(zipped, _.spread(tupleEqual));
};

/**
 * Check that an adapter has executed expected SQL and args.
 *
 *   .should.have.executed('SELECT 1')
 *   .should.have.executed('SELECT ?', [1])
 *   .should.have.executed('BEGIN', 'SELECT ?', [1], 'COMMIT')
 *
 *   // if you provide all arrays, they will be flattened
 *   var start = ['BEGIN'];
 *   var end = ['COMMIT'];
 *   .should.have.executed(start, ['SELECT ?', [1]], end)
 *
 * @public
 * @function used
 * @param {String} sql
 * @param {Array} [args]
 */
exports.executed = function(chai/*, utils*/) {
  var Assertion = chai.Assertion;
  new Assertion(this._obj).to.be.instanceof(Class.__class__);
  new Assertion(this._obj.__identity__.__mixins__).to.contain(AdapterSpy);

  // turn all given statements into pairs with args
  var args = _.toArray(arguments).slice(2);
  var statements = createTuples(args);
  var executed = this._obj.executedSQL;

  this.assert(tuplesEqual(statements, executed),
    'expected #{this} to have executed #{exp} but got #{act}',
    'expected #{this} to not have executed #{act}',
    statements.map(formatPair),
    executed.map(formatPair), true);
};

/**
 * Check that an adapter has attempted execution of SQL and args.
 *
 * @public
 * @function used
 * @param {String} sql
 * @param {Array} [args]
 * @see {@link executed}
 */
exports.attempted = function(chai/*, utils*/) {
  var Assertion = chai.Assertion;
  new Assertion(this._obj).to.be.instanceof(Class.__class__);
  new Assertion(this._obj.__identity__.__mixins__).to.contain(AdapterSpy);

  // turn all given statements into pairs with args
  var args = _.toArray(arguments).slice(2);
  var statements = createTuples(args);
  var attempted = this._obj.attemptedSQL;

  this.assert(tuplesEqual(statements, attempted),
    'expected #{this} to have attempted #{exp} but got #{act}',
    'expected #{this} to not have attempted #{act}',
    statements.map(formatPair),
    attempted.map(formatPair), true);
};

/**
 * Language chain for use with {@link clients}
 *
 *   .should.have.used.clients
 *
 * @public
 * @property used
 */
exports.used = function(/*chai, utils*/) { return this; };
exports.used.via = 'addProperty';

/**
 * Check that any number of clients were used with an adapter.
 *
 *   .should.have.used.clients
 *
 * @public
 * @property clients
 */
exports.clients = function(chai, utils) {
  var Assertion = chai.Assertion;
  new Assertion(this._obj).to.be.instanceof(Class.__class__);
  new Assertion(this._obj.__identity__.__mixins__).to.contain(AdapterSpy);
  new Assertion(this._obj).to.have.property('clients');

  var assertClients = new Assertion(this._obj.clients,
    'adapter assert client usage');
  utils.transferFlags(this, assertClients, false);
  assertClients.length.above(0);
};
exports.clients.via = 'addProperty';

/**
 * Check that exactly one client was used with an adapter.
 *
 *   .should.have.used.oneClient
 *
 * @public
 * @property clients
 */
exports.oneClient = function(chai, utils) {
  var Assertion = chai.Assertion;
  new Assertion(this._obj).to.be.instanceof(Class.__class__);
  new Assertion(this._obj.__identity__.__mixins__).to.contain(AdapterSpy);
  new Assertion(this._obj).to.have.property('clients');

  var assertClients = new Assertion(this._obj.clients,
    'adapter assert client usage');
  utils.transferFlags(this, assertClients, false);
  assertClients.length(1);
};
exports.oneClient.via = 'addProperty';

/**
 * Check that an exact number of clients were used with an adapter.
 *
 *   .should.have.clientCount(5)
 *
 * @public
 * @property clients
 */
exports.clientCount = function(chai, utils, n) {
  var Assertion = chai.Assertion;
  new Assertion(this._obj).to.be.instanceof(Class.__class__);
  new Assertion(this._obj.__identity__.__mixins__).to.contain(AdapterSpy);
  new Assertion(this._obj).to.have.property('clients');

  var assertClients = new Assertion(this._obj.clients,
    'adapter assert client usage');
  utils.transferFlags(this, assertClients, false);
  assertClients.length(n);
};
