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

  it('can generate sequences for queries', function() {
    adapter.sequence(/.*/, 1);
    return query.select('t1').then(function(result) {
      result.should.eql({ fields: ['id'], rows: [{ id: 1 }] });
    })
    .then(function() { return query.select('t1'); })
    .then(function(result) {
      result.should.eql({ fields: ['id'], rows: [{ id: 2 }] });
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

  it('can scope expectations', function() {
    var scope = adapter.scope.bind(adapter);
    var unscope = adapter.unscope.bind(adapter);
    return query.raw('select 1')
    .then(scope)
    .then(function() { return query.raw('select 2'); })
    .then(function() {
      adapter.should.have.executed('select 2');
      adapter.should.have.used.oneClient;
    })
    .then(unscope)
    .then(function() {
      adapter.should.have.executed('select 1', 'select 2');
      adapter.should.have.clientCount(2);
    });
  });

}));
