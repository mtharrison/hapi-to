const test = require('tape').test;
const { setup } = require('./utils');

test('akaya >> can get a URL to a named route', t => {
  const { server } = setup();
  
  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('hello'));
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
  
  server.inject('/', res => {
    t.equal(res.payload, 'http://localhost:1337/hello');
    t.end();
  });
});

test('akaya >> works with routes inside plugins with prefixes', t => {
  const { server } = setup();

  function plugin(serv, options, next) {
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
  }

  plugin.attributes = { name: 'plugin' };

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('hello'));
    }
  });

  server.register(plugin, { routes: { prefix: '/prefixed-with' } }, function () {
    server.inject('/', function (res) {

      t.equal(res.payload, 'http://localhost:1337/prefixed-with/hello');
      t.end();
    });
  });
});

test('akaya >> throws if there\'s no matching route', t => {
  const { server } = setup();

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('hello'));
    }
  });

  t.throws(() => server.inject('/', res => {}), /Error/);
  t.end();
});

test('akaya >> throws if there\'s no specified params for a path with params', t => {
  const { server } = setup();

  server.route({
    config: {
      id: 'hello'
    },
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
      reply(request.aka('hello'));
    }
  });

  t.throws(() => server.inject('/john', res => {}), /Error/);
  t.end();
});

test('akaya >> throws if there\'s a mismatch in number of params required and given', t => {
  const { server } = setup();

  server.route({
    config: {
      id: 'hello'
    },
    method: 'GET',
    path: '/{hello}/to/{name}',
    handler: function (request, reply) {
      reply(request.aka('hello', { params: { hello: 'there' } }));
    }
  });

  t.throws(() => server.inject('/hello/to/you', res => {}), /Error/);
  t.end();
});

test('akaya >> can place params in the URL', t => {
  const { server } = setup();

  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('me', { params: { name: 'matt', age: '29' } }));
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

  server.inject('/', res => {
    t.equal(res.payload, 'http://localhost:1337/i/am/matt/and/age/29');
    t.end();
  });
});

test('akaya >> works on wildcard params', t => {
  const { server} = setup();

  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('me', { params: { path: 'something/good' } }));
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

  server.inject('/', res => {
    t.equal(res.payload, 'http://localhost:1337/something/good');
    t.end();
  });
});

test('akaya >> works on multi params', t => {
  const { server } = setup();

  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('me', { params: { path: ['a', 'b', 'c'] } }));
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

  server.inject('/', res => {
    t.equal(res.payload, 'http://localhost:1337/a/b/c');
    t.end();
  });
});

test('akaya >> throws if incorrect num of params given for multi param path', t => {
  const { server } = setup();

  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('me', { params: { path: ['a', 'b'] } }));
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

  t.throws(() => server.inject('/', res => {}), /Error/);
  t.end();
});

test('akaya >> Strips optional params from path if none specified', t => {
  const { server } = setup();

  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('route'));
    }
  }, {
    method: 'GET',
    path: '/optional/{param?}',
    config: {
      id: 'route',
      handler: function (request, reply) {
        reply();
      }
    }
  }]);

  server.inject('/', res => {
    t.equal(res.statusCode, 200);
    t.equal(res.payload, 'http://localhost:1337/optional');
    t.end();
  });
});

test('akaya >> can append a query string', t => {
  const { server } = setup();

  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('me', {
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

  server.inject('/', res => {

    t.equal(res.payload, 'http://localhost:1337/i/am/matt/and/age/29?good=morning&night=night');
    t.end();
  });
});
