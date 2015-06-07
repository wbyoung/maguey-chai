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
    /* jscs:disable jsDoc */

    if (_.isString(regex)) { regex = new RegExp(regex, 'i'); }
    var responder = function(/*client, sql, args*/) {
      throw new Error('FakeFail for ' + regex.toString());
    };
    responder.regex = regex;
    this._responders.unshift(responder);

    /* jscs:enable jsDoc */
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
    /* jscs:disable jsDoc */

    var fields = arguments[2] || _(result).map(_.keys).flatten().uniq().value();
    var responder = function(/*client, sql, args*/) {
      return { rows: result, fields: fields };
    };
    responder.regex = regex;
    this._responders.unshift(responder);

    /* jscs:enable jsDoc */
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
