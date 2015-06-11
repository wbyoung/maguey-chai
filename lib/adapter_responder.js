'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var Mixin = require('corazon/mixin');

/**
 * A mixin to spy on SQL being executed by any adapter.
 *
 * This is intended to be mixed in after the {@link Adapter#_execute} method
 * override has been defined on the adapter subclass.
 *
 * @mixin AdapterResponder
 */
module.exports = Mixin.create(/** @lends AdapterResponder# */ {
  init: function() {
    this._super.apply(this, arguments);
    this._responders = [];
  },

  /**
   * Add a fake failure for a regex match or string (case insensitive).
   *
   * @param {String|RegExp} regex
   */
  fail: function(regex) {
    if (_.isString(regex)) { regex = new RegExp(regex, 'i'); }
    this.custom(regex, function(/*client, sql, args*/) {
      throw new Error('FakeFail for ' + regex.toString());
    });
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
    var fields = arguments[2] || _(result)
      .map(_.keys).flatten()
      .uniq().value();

    this.custom(regex, function(/*client, sql, args*/) {
      return { rows: result, fields: fields };
    });
  },

  /**
   * Add a fake response that returns serial ids for a regex match.
   *
   * @param {RegExp} regex The SQL to match.
   * @param {Number} n The starting number for the sequence.
   */
  sequence: function(regex, n) {
    this.custom(regex, function(/*client, sql, args*/) {
      return { rows: [{ id: n++ }], fields: ['id'] };
    });
  },

  /**
   * Add a fake response that returns the result of a function.
   *
   * @param {RegExp} regex The SQL to match.
   * @param {function(Object, String, Array): Object} fn The function to call
   * to obtain the value.
   */
  custom: function(regex, fn) {
    var responder = _.partial(fn); // copy the function
    responder.regex = regex;
    this._responders.unshift(responder);
  },

  /**
   * Respond with any fake responses that have been added.
   *
   * @method
   * @protected
   * @see {@link Adapter#_execute}
   */
  _execute: Promise.method(function(client, sql, args) {
    var _super = this._super.apply.bind(this._super, this, arguments);
    return Promise.delay(0).bind(this).then(function() {
      var responder = _.find(this._responders, function(responder) {
        return sql.match(responder.regex);
      });
      var result = responder && responder(client, sql, args);
      return result || _super();
    });
  }),

});
