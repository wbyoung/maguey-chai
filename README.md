# Maguey Chai

[![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url] [![Code Climate][codeclimate-image]][codeclimate-url] [![Coverage Status][coverage-image]][coverage-url] [![Dependencies][david-image]][david-url] [![devDependencies][david-dev-image]][david-dev-url]

Chai assertions & test helpers for [Maguey][maguey].

```js
chai.use(require('maguey-chai'));

query.raw('select 1').should.be.a.query('select 1');
query.raw('select ?', [1]).should.be.a.query('select ?', [1]);

adapter.should.have.executed('select 1');
adapter.should.have.executed('begin', 'select ?', [1], 'commit');

adapter.should.have.used.clients;
adapter.should.have.used.oneClient;
adapter.should.have.clientCount(1);
```


## License

This project is distributed under the MIT license.


[maguey]: https://github.com/wbyoung/maguey

[travis-image]: http://img.shields.io/travis/wbyoung/maguey-chai.svg?style=flat
[travis-url]: http://travis-ci.org/wbyoung/maguey-chai
[npm-image]: http://img.shields.io/npm/v/maguey-chai.svg?style=flat
[npm-url]: https://npmjs.org/package/maguey-chai
[codeclimate-image]: http://img.shields.io/codeclimate/github/wbyoung/maguey-chai.svg?style=flat
[codeclimate-url]: https://codeclimate.com/github/wbyoung/maguey-chai
[coverage-image]: http://img.shields.io/coveralls/wbyoung/maguey-chai.svg?style=flat
[coverage-url]: https://coveralls.io/r/wbyoung/maguey-chai
[david-image]: http://img.shields.io/david/wbyoung/maguey-chai.svg?style=flat
[david-url]: https://david-dm.org/wbyoung/maguey-chai
[david-dev-image]: http://img.shields.io/david/dev/wbyoung/maguey-chai.svg?style=flat
[david-dev-url]: https://david-dm.org/wbyoung/maguey-chai#info=devDependencies
