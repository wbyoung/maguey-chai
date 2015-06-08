'use strict';

require('./_helpers');

describe('assertions', __query(function() {
  /* global query, adapter */

  it('can validate a query', function() {
    query.raw('select 1').should.be.a.query('select 1');
  });

  it('produces error for mismatched sql', function() {
    expect(function() {
      query.raw('select 1').should.be.a.query('select');
    })
    .to.throw(/to have.*select 1 ~\[\]/);
  });

  it('produces error for mismatched args', function() {
    expect(function() {
      query.raw('select ?', [1]).should.be.a.query('select ?', [5]);
    })
    .to.throw(/to have.*select \? ~\[1\]/);
  });

  it('can validate executed sql', function() {
    return query.raw('select 1').then(function() {
      adapter.should.have.executed('select 1');
    });
  });

  it('can validate multiple executed sql', function() {
    return query.raw('select 1')
    .then(function() { return query.raw('select 1'); })
    .then(function() {
      adapter.should.have.executed('select 1', 'select 1');
    });
  });

  it('can validate multiple executed sql via arrays', function() {
    return query.raw('select 1')
    .then(function() { return query.raw('select 1'); })
    .then(function() {
      adapter.should.have.executed(['select 1', 'select 1']); // array
      adapter.should.have.executed(['select 1'], ['select 1']); // flatten
    });
  });

  it('can validate executed sql via regex', function() {
    return query.raw('select 1').then(function() {
      adapter.should.have.executed(/select \d/);
    });
  });

  it('cannot validate executed args via regex', function() {
    return query.raw('select ?', ['1']).then(function() {
      expect(function() {
        adapter.should.have.executed('select ?', [/\d/]);
      })
      .to.throw(/to have.*select \? ~\[\/\\\\d\/\].*got.*select \? ~\[1\]/);
    });
  });

  it('produces error for mismatched executed sql', function() {
    return query.raw('select 1').then(function() {
      expect(function() {
        adapter.should.have.executed('select');
      })
      .to.throw(/to have.*select ~\[\].*got.*select 1 ~\[\]/);
    });
  });

  it('produces error for un-executed sql', function() {
    expect(function() {
      adapter.should.have.executed('select');
    })
    .to.throw(/to have.*select ~\[\].*got \[\]$/);
  });


  it('produces error for mismatched executed args', function() {
    return query.raw('select ?', [1]).then(function() {
      expect(function() {
        adapter.should.have.executed('select ?', [2]);
      })
      .to.throw(/to have.*select \? ~\[2\].*got.*select \? ~\[1\]/);
    });
  });

  it('can validate attempted sql', function() {
    adapter.fail(/.*/);
    return query.raw('select 1').execute()
    .throw('expected failure')
    .catch(function(/*e*/) {
      adapter.should.have.executed(/* nothing */);
      adapter.should.have.attempted('select 1');
    });
  });

  it('can validate used clients', function() {
    return query.raw('select 1').then(function() {
      adapter.should.have.used.clients;
      adapter.should.have.used.oneClient;
      adapter.should.have.clientCount(1);
    });
  });

  it('can negate validation of used clients', function() {
    adapter.should.not.have.used.clients;
    adapter.should.not.have.used.oneClient;
    adapter.should.not.have.clientCount(1);
  });

}));
