const Hapi = require('hapi');
const plugin = require('../src');

const setup = () => {
  const fixtures = {
    server: new Hapi.Server(),
  };

  fixtures.server.connection({
    port: 1337,
    host: 'localhost'
  });

  fixtures.server.register(plugin, err => {});

  return fixtures;
};

module.exports = {
  setup,
};
