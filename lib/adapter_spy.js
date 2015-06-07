'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var Mixin = require('corazon/mixin');
var property = require('corazon/property');

/**
 * A mixin to spy on SQL being executed by any adapter.
 *
 * This is intended to be mixed in after the {@link Adapter#_execute} method
 * override has been defined on the adapter subclass. If using
 * {@link AdapterResponder}, it should be installed after that as well.
 *
 * @mixin AdapterSpy
 */
module.exports = Mixin.create(/** @lends AdapterSpy# */ {
  init: function() {
    this._super.apply(this, arguments);
    this._clients = [];
    this._executed = [];
    this._attempted = [];
  },

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
   * Store attempted & executed queries as well as the client used to execute
   * them.
   *
   * @method
   * @protected
   * @see {@link Adapter#_execute}
   */
  _execute: Promise.method(function(client, sql, args) {
    this._attempted.push([sql, args]);

    return this._super.apply(this, arguments).tap(function() {
      this._clients = _.uniq(this._clients.concat([client]));
      this._executed.push([sql, args]);
    }.bind(this));
  }),

});
