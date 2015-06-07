'use strict';

var maguey = require('./').__maguey || require('maguey'); // reset-annotation
var Adapter = maguey.Adapter;
var Promise = require('bluebird');

/**
 * Fake adapter for testing.
 *
 * @public
 * @constructor
 * @extends Adapter
 * @mixes AdapterSpy
 * @mixes AdapterResponder
 */
var FakeAdapter = Adapter.extend(/** @lends FakeAdapter */ {

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
   * Execute for FakeAdapter.
   *
   * @method
   * @protected
   * @see {@link Adapter#_execute}
   */
  _execute: Promise.method(function(/*client, sql, args*/) {
    return { rows: [], fields: [] };
  }),

}, { cid: 0 });

FakeAdapter.reopen(require('./adapter_responder'));
FakeAdapter.reopen(require('./adapter_spy'));

module.exports = FakeAdapter.reopenClass({ __name__: 'FakeAdapter' });
