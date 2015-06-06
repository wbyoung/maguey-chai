'use strict';

require('./helpers');

describe('assertions', __query(function() {
  /* global query */

  it('can validate a query', function() {
    query.select('t1').should.be.a.query('SELECT * FROM "t1"');
  });

  it('produces error for mismatched sql', function() {
    expect(function() {
      query.select('t1').should.be.a.query('SELECT');
    })
    .to.throw(/to have.*SELECT \* FROM "t1" ~\[\]/);
  });

  it('produces error for mismatched args', function() {
    expect(function() {
      query.select('t1').should.be.a.query('SELECT', [5]);
    })
    .to.throw(/to have.*SELECT \* FROM "t1" ~\[\]/);
  });

}));
