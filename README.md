# hapi-to

This plugin gives you an API for generating URLs dynamically in hapi using route ids and optional parameters, so you don't need to hardcode them into your views. This helps a bunch if you change the path structure of your routes in the future.

##Install

To download and add to dependencies run `npm install --save hapi-to`

Register with a server like any other hapi plugin with `server.register()`:

```javascript
var Hapi = require('hapi');

var server= new Hapi.Server();
server.connection({ port: 8080 });

server.register(require('hapi-to'), function (err) {
    
    if (err) {
        throw err;
    }
    
    server.start();
});
```

After registering, hapi-to will decorate the [hapi request object](hapijs.com/api#request-object) with a new method: `request.to()`.

##API

### `request.to(id, params, options)`

Injects a fake request into an HTTP server.

- `id` - required route id. Set when creating a route with the `config.id` property.
- `params` - request parameters where:
  - `query` - an optional object of query string key-values. Will be stringified using the Qs module.
  - `path` - an optional object of path parameters. Number given must match route path.
- `options` - additional options which affect how the URL is generated where:
  - `rel` - Whether to generate a relative URL. Can be` true` or `false` (default).
  - `secure` - a boolean or "match". If `true` the URL will be https, if `false` will be http. If `"match`" (the default) will match the x-forwarded-proto header or the current request's connection protocol (in that order).
  - `host` - string that sets the host in the URL. Default is to match the current request.

##Example

```javascript
var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({ port: 8080 });

server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {

        reply.redirect(request.to('hello'));
    }
}, {
    method: 'GET',
    path: '/not-hello-anymore',
    config: {
        id: 'hello',
        handler: function (request, reply) {

            reply('You got here!');
        }
    }
}]);

server.register(require('hapi-to'), function (err) {
    
    server.start();
});
