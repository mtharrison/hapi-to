const test = require('tape').test;
const { setup } = require('./utils');

test('akaya/options >> secure option when `true` forces https', t => {
  const { server } = setup();

  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('hello', {}, { secure: true }));
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
    t.equal(res.payload, 'https://localhost:1337/hello');
    t.end();
  });
});

test('akaya/options >> secure option when `false` forces http', t => {
  const { server } = setup();

  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('hello', {}, { secure: false }));
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

test('akaya/options >> auto detecting secure option when not set', t => {
  const { server } = setup();
  
  const options = {
    method: 'GET',
    url: 'http://localhost:1337',
    headers: {
      'x-forwarded-proto': 'http'
    }
  };

  const options2 = {
    method: 'GET',
    url: 'http://localhost:1337',
    headers: {
      'x-forwarded-proto': 'https'
    }
  };
  
  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('hello', {}));
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

  server.inject(options, res =>{
    t.equal(res.payload, 'http://localhost:1337/hello');

    server.inject(options2, res2 => {
      t.equal(res2.payload, 'https://localhost:1337/hello');
      t.end();
    });
  });
});

test('akaya/options >> gives a relative url when rel is true', t => {
  const { server } = setup();

  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('hello', { }, { rel: true }));
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
    t.equal(res.payload, '/hello');
    t.end();
  });
});

test(' akaya/options >> can override the host with host option', t => {
  const { server } = setup();

  server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.aka('hello', { }, { host: 'beef.io:5000' }));
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
    t.equal(res.payload, 'http://beef.io:5000/hello');
    t.end();
  });
});
