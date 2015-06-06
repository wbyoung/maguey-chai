'use strict';

require('./_helpers');

describe('fake adapter', __query(function() {
  /* global query, adapter */

  it('can respond to queries', function() {
    adapter.respond(/.*/, [{ val: 1 }]);
    return query.select('t1').then(function(result) {
      result.should.eql({ fields: ['val'], rows: [{ val: 1 }] });
    });
  });

  it('does not respond when regex does not match', function() {
    adapter.respond(/nomatch/, [{ val: 1 }]);
    return query.select('t1').then(function(result) {
      result.should.eql({ fields: [], rows: [] });
    });
  });

  it('can produce failures', function() {
    adapter.fail(/.*/);
    return query.select('t1').execute()
    .throw('expected failure')
    .catch(function(e) {
      e.should.match(/fakefail/i);
    });
  });

  it('can produce failures matching strings', function() {
    adapter.fail('select');
    return query.select('t1').execute()
    .throw('expected failure')
    .catch(function(e) {
      e.should.match(/fakefail/i);
    });
  });

  it('does not produce failures when regex does not match', function() {
    adapter.fail(/nomatch/);
    return query.select('t1');
  });

  it('can disconnect', function() {
    return adapter._disconnect();
  });

}));
