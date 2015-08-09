# hapi-to [![Build Status](https://travis-ci.org/mtharrison/hapi-to.svg)](https://travis-ci.org/mtharrison/hapi-to)

This plugin gives you an API for generating URLs dynamically in hapi using route ids and optional parameters, so you don't need to hardcode them into your views. This helps a bunch if you change the path structure of your routes, or move them into prefixed plugins in the future.

##Features

 - Let's you change paths without breaking existing links + redirects
 - 100% test coverage
 - Works with params (including wildcard and multi-params)
 - Configurable with options

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

Returns a URL to a route

- `id` - required route id. Set when creating a route with the `config.id` property.
- `params` - request parameters where:
  - `query` - an optional object of query string key-values. Will be stringified using the Qs module.
  - `params` - an optional object of path parameters. Number given must match route path. Each parameter value can be a string or an array of strings (for multi params)
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

        var url = request.to('hello', {
            params: { thing: 'stitch', num: 'nine' },
            query: { page: '1' }
        });

        reply.redirect(url);
    }
}, {
    method: 'GET',
    path: '/multi',
    handler: function (request, reply) {

        var url = request.to('rick', {
            params: { multi: ['never', 'gonna', 'give', 'you', 'up'] }
        });

        reply.redirect(url);
    }
}, {
    method: 'GET',
    path: '/a/{thing}/in/{num}/saves/time',
    config: {
        id: 'hello',
        handler: function (request, reply) {

            reply('You got here!');
        }
    }
}, {
    method: 'GET',
    path: '/{multi*5}',
    config: {
        id: 'rick',
        handler: function (request, reply) {

            reply('You got here!');
        }
    }
}]);

server.register(require('hapi-to'), function (err) {
    
    server.start();
});
```

If you run the above example and navigate to http://localhost:8080/ you will be redirected to http://localhost:8080/a/stitch/in/nine/saves/time?page=1

If you navigate to http://localhost:8080/multi you will be redirected to http://localhost:8080/never/gonna/give/you/up

## Contributing

Issues and PRs are welcome. If you have any questions or suggestions please open an issue.