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
 * Check that an adapter has executed expected SQL and args.
 *
 *   .should.have.executed('SELECT 1')
 *   .should.have.executed('SELECT ?', [1])
 *   .should.have.executed('BEGIN', 'SELECT ?', [1], 'COMMIT')
 *
 * @public
 * @function used
 * @param {String} sql
 * @param {Array} [args]
 */
exports.executed = function(chai, utils) {
  var Assertion = chai.Assertion;
  new Assertion(this._obj).to.be.instanceof(Class.__class__);
  new Assertion(this._obj.__identity__.__mixins__).to.contain(AdapterSpy);

  // turn all given statements into pairs with args
  var args = _.toArray(arguments);
  var statements = _.transform(args, function(result, item, i, obj) {
    var itemArgs = obj[i + 1];
    if (!_.isArray(itemArgs)) { itemArgs = []; }
    if (_.isString(item)) {
      result.push([item, itemArgs]);
    }
  }, []);
  var executed = this._obj.executedSQL;

  this.assert(utils.eql(statements, executed),
    'expected #{this} to have executed #{exp} but got #{act}',
    'expected #{this} to not have executed #{act}',
    statements.map(formatPair).join(', '),
    executed.map(formatPair).join(', '));
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
