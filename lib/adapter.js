'use strict';

var _ = require('lodash');
var maguey = require('maguey'); // reset-annotation
var Promise = require('bluebird');
var Adapter = maguey.Adapter;
var property = require('corazon/property');

/**
 * Fake adapter for testing.
 *
 * @public
 * @constructor
 * @extends Adapter
 */
var FakeAdapter = Adapter.extend({
  init: function() {
    this._super.apply(this, arguments);
    this._responders = [];
    this._clients = [];
    this._executed = [];
    this._attempted = [];
  },

  /**
   * Connect for FakeAdapter.
   *
   * @method
   * @protected
   * @see {@link Adapter#_connect}
   */
  _connect: Promise.method(function() {
    return { id: this.__identity__.cid++ };
  }),

  /**
   * Disconnect for FakeAdapter.
   *
   * @method
   * @protected
   * @see {@link Adapter#_disconnect}
   */
  _disconnect: Promise.method(function(/*client*/) { }),

  /**
   * Get all SQL & args that have been executed.
   *
   * @return {Array} An array of SQL/arg pairs.
   */
  executedSQL: property({ property: '_executed' }),

  /**
   * Get all SQL & args that have been attempted (including those executed).
   *
   * @return {Array} An array of SQL/arg pairs.
   */
  attemptedSQL: property({ property: '_attempted' }),

  /**
   * Get clients that have been used to execute queries.
   *
   * @return {Array} An array of client objects.
   */
  clients: property(),

  /**
   * Add a fake failure for a regex match or string (case insensitive).
   *
   * @param {String|RegExp} regex
   */
  fail: function(regex) {
    if (_.isString(regex)) { regex = new RegExp(regex, 'i'); }
    var responder = function(/*client, sql, args*/) {
      throw new Error('FakeFail for ' + regex.toString());
    };
    responder.regex = regex;
    this._responders.unshift(responder);
  },

  /**
   * Add a fake response for a regex match.
   *
   * @param {RegExp} regex The SQL to match.
   * @param {Array.<Object>} result The result that would come from the
   * database.
   * @param {Array.<String>} [fields] The field names that would come from the
   * database (built from result if not provided).
   */
  respond: function(regex, result) {
    var fields = arguments[2] || _(result).map(_.keys).flatten().uniq().value();
    var responder = function(/*client, sql, args*/) {
      return { rows: result, fields: fields };
    };
    responder.regex = regex;
    this._responders.unshift(responder);
  },

  /**
   * Execute for FakeAdapter.
   *
   * @method
   * @protected
   * @see {@link Adapter#_execute}
   */
  _execute: Promise.method(function(client, sql, args) {

    this._attempted.push([sql, args]);

    return Promise.delay(1).bind(this).then(function() {
      var responder = _.find(this._responders, function(responder) {
        return sql.match(responder.regex);
      });
      var result = responder && responder(client, sql, args);

      this._clients = _.uniq(this._clients.concat([client]));
      this._executed.push([sql, args]);

      return result || { rows: [], fields: [] };
    });
  }),

}, { cid: 0 });


module.exports = FakeAdapter.reopenClass({ __name__: 'FakeAdapter' });
