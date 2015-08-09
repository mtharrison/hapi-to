// Load modules

var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');

// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;
var beforeEach = lab.beforeEach;


describe('request.to()', function () {

    var server;

    beforeEach(function (done) {

        server = new Hapi.Server();
        server.connection({ port: 4000 });
        server.register(require('../'), function (err) {});

        done();
    });

    it('Can get a URL to a named route', function (done) {

        server.route([{
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                reply(request.to('hello'));
            }
        }, {
            method: 'GET',
            path: '/hello',
            config: {
                id: 'hello',
                handler: function (request, reply) {

                    reply();
                }
            }
        }]);

        server.inject('http://localhost:4000/', function (res) {

            expect(res.payload).to.equal('http://localhost:4000/hello');
            done();
        });
    });

    it('works with routes inside plugins with prefixes', function (done) {

        var plugin = function (serv, options, next) {

            serv.route({
                method: 'GET',
                path: '/hello',
                config: {
                    id: 'hello',
                    handler: function (request, reply) {

                        reply();
                    }
                }
            });

            next();
        };

        plugin.attributes = { name: 'plugin' };

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                reply(request.to('hello'));
            }
        });

        server.register(plugin, { routes: { prefix: '/prefixed-with' } }, function () {

            server.inject('http://localhost:4000/', function (res) {

                expect(res.payload).to.equal('http://localhost:4000/prefixed-with/hello');
                done();
            });
        });
    });

    it('Throws if there\'s no matching route', function (done) {

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                reply(request.to('hello'));
            }
        });

        server.inject('http://localhost:4000/', function (res) {

            expect(res.statusCode).to.equal(500);
            done();
        });
    });

    it('Throws if there\'s no specified params for a path with params', function (done) {

        server.route({
            config: {
                id: 'hello'
            },
            method: 'GET',
            path: '/{name}',
            handler: function (request, reply) {

                reply(request.to('hello'));
            }
        });

        server.inject('http://localhost:4000/john', function (res) {

            expect(res.statusCode).to.equal(500);
            done();
        });
    });

    it('Throws if there\'s a mismatch in number of params required and given', function (done) {

        server.route({
            config: {
                id: 'hello'
            },
            method: 'GET',
            path: '/{hello}/to/{name}',
            handler: function (request, reply) {

                reply(request.to('hello', { params: { hello: 'there' } }));
            }
        });

        server.inject('http://localhost:4000/hello/to/you', function (res) {

            expect(res.statusCode).to.equal(500);
            done();
        });
    });

    it('Can place params in the URL', function (done) {

        server.route([{
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                reply(request.to('me', { params: { name: 'matt', age: '29' } }));
            }
        }, {
            method: 'GET',
            path: '/i/am/{name}/and/age/{age}',
            config: {
                id: 'me',
                handler: function (request, reply) {

                    reply();
                }
            }
        }]);

        server.inject('http://localhost:4000/', function (res) {

            expect(res.payload).to.equal('http://localhost:4000/i/am/matt/and/age/29');
            done();
        });
    });

    it('Works on wildcard params', function (done) {

        server.route([{
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                reply(request.to('me', { params: { path: 'something/good' } }));
            }
        }, {
            method: 'GET',
            path: '/{path*}',
            config: {
                id: 'me',
                handler: function (request, reply) {

                    reply();
                }
            }
        }]);

        server.inject('http://localhost:4000/', function (res) {

            expect(res.payload).to.equal('http://localhost:4000/something/good');
            done();
        });
    });

    it('Works on multi params', function (done) {

        server.route([{
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                reply(request.to('me', { params: { path: ['a', 'b', 'c'] } }));
            }
        }, {
            method: 'GET',
            path: '/{path*3}',
            config: {
                id: 'me',
                handler: function (request, reply) {

                    reply();
                }
            }
        }]);

        server.inject('http://localhost:4000/', function (res) {

            expect(res.payload).to.equal('http://localhost:4000/a/b/c');
            done();
        });
    });

    it('Throws if incorrect num of params given for multi param path', function (done) {

        server.route([{
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                reply(request.to('me', { params: { path: ['a', 'b'] } }));
            }
        }, {
            method: 'GET',
            path: '/{path*3}',
            config: {
                id: 'me',
                handler: function (request, reply) {

                    reply();
                }
            }
        }]);

        server.inject('http://localhost:4000/', function (res) {

            expect(res.statusCode).to.equal(500);
            done();
        });
    });

    it('Can append a query string', function (done) {

        server.route([{
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                reply(request.to('me', {
                    params: {
                        name: 'matt',
                        age: '29'
                    },
                    query: {
                        good: 'morning',
                        night: 'night'
                    }
                }));
            }
        }, {
            method: 'GET',
            path: '/i/am/{name}/and/age/{age}',
            config: {
                id: 'me',
                handler: function (request, reply) {

                    reply();
                }
            }
        }]);

        server.inject('http://localhost:4000/', function (res) {

            expect(res.payload).to.equal('http://localhost:4000/i/am/matt/and/age/29?good=morning&night=night');
            done();
        });
    });

    describe('[options]', function () {

        it('secure option when `true` forces https', function (done) {

            server.route([{
                method: 'GET',
                path: '/',
                handler: function (request, reply) {

                    reply(request.to('hello', {}, { secure: true }));
                }
            }, {
                method: 'GET',
                path: '/hello',
                config: {
                    id: 'hello',
                    handler: function (request, reply) {

                        reply();
                    }
                }
            }]);

            server.inject('http://localhost:4000/', function (res) {

                expect(res.payload).to.equal('https://localhost:4000/hello');
                done();
            });
        });

        it('secure option when `false` forces http', function (done) {

            server.route([{
                method: 'GET',
                path: '/',
                handler: function (request, reply) {

                    reply(request.to('hello', {}, { secure: false }));
                }
            }, {
                method: 'GET',
                path: '/hello',
                config: {
                    id: 'hello',
                    handler: function (request, reply) {

                        reply();
                    }
                }
            }]);

            server.inject('https://localhost:4000/', function (res) {

                expect(res.payload).to.equal('http://localhost:4000/hello');
                done();
            });
        });

        it('secure option when `"match"` matches the current request', function (done) {

            server.route([{
                method: 'GET',
                path: '/',
                handler: function (request, reply) {

                    reply(request.to('hello', {}, { secure: 'match' }));
                }
            }, {
                method: 'GET',
                path: '/hello',
                config: {
                    id: 'hello',
                    handler: function (request, reply) {

                        reply();
                    }
                }
            }]);

            var options = {
                method: 'GET',
                url: 'http://localhost:4000',
                headers: {
                    'x-forwarded-proto': 'http'
                }
            };

            server.inject(options, function (res) {

                expect(res.payload).to.equal('http://localhost:4000/hello');

                var options2 = {
                    method: 'GET',
                    url: 'http://localhost:4000',
                    headers: {
                        'x-forwarded-proto': 'https'
                    }
                };

                server.inject(options2, function (res2) {

                    expect(res2.payload).to.equal('https://localhost:4000/hello');
                    done();
                });
            });

        });

        it('gives a relative url when rel is true', function (done) {

            server.route([{
                method: 'GET',
                path: '/',
                handler: function (request, reply) {

                    reply(request.to('hello', { }, { rel: true }));
                }
            }, {
                method: 'GET',
                path: '/hello',
                config: {
                    id: 'hello',
                    handler: function (request, reply) {

                        reply();
                    }
                }
            }]);

            server.inject('http://localhost:4000/', function (res) {

                expect(res.payload).to.equal('/hello');
                done();
            });
        });

        it('can override the host with host option', function (done) {

            server.route([{
                method: 'GET',
                path: '/',
                handler: function (request, reply) {

                    reply(request.to('hello', { }, { host: 'beef.io:5000' }));
                }
            }, {
                method: 'GET',
                path: '/hello',
                config: {
                    id: 'hello',
                    handler: function (request, reply) {

                        reply();
                    }
                }
            }]);

            server.inject('http://localhost:4000/', function (res) {

                expect(res.payload).to.equal('http://beef.io:5000/hello');
                done();
            });
        });

    });

});
