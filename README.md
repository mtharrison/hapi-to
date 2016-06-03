# hapi-to [![Build Status](https://travis-ci.org/mtharrison/hapi-to.svg)](https://travis-ci.org/mtharrison/hapi-to)
#### Generate URIs based on named [hapi](https://github.com/hapijs/hapi) routes, their ID and parameters
---

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API](#api)
5. [Example](#example)
6. [Testing](#testing)
7. [Contribution](#contribution)

## Introduction

This plugin gives you an API for generating URLs dynamically in [hapi](https://github.com/hapijs/hapi) using route ids and optional parameters, so you don't need to hardcode them into your views. This helps a bunch if you change the path structure of your routes, or move them into prefixed plugins in the future.

This plugin is implemented in ECMAScript 6. Therefore the development dependencies are based on `babel`. Additionally `eslint` and `tape` are used to grant a high quality implementation.

**Features**
 - Let's you change paths without breaking existing links + redirects
 - 100% test coverage
 - Works with query and path params (including wildcard, optional and multi-params)
 - Configurable with options

## Installation
For installation use the [Node Package Manager](https://github.com/npm/npm):
```
// production version with ES5 syntax
$ npm install --save hapi-to
```

or clone the repository:
```
// development version with ES6 syntax
$ git clone https://github.com/mtharrison/hapi-to
```
## Usage
#### Import
First you have to import the module:
``` js
const hapiTo = require('hapi-to');
```

#### Create hapi server
Afterwards create your hapi server and the corresponding connection if not already done:
``` js
const server = new Hapi.Server();

server.connection({
  port: 8888,
  host: 'localhost',
});
```

#### Registration
Finally register the plugin per `server.register()`:
``` js
server.register(hapiTo, err => {
  if (err) {
    throw err;
  }

  server.start();
});
```

After registering, hapi-to will decorate the [hapi request object](hapijs.com/api#request-object) with a new method: `request.to()`.

## API
#### `request.to(id, [params], [options])`

Returns a URL to a route
- `id` - required routes `config.id`.
- `params`
  - `query` - [Object.<?string>] Necessary query parameters, which will be stringified.
  - `params` - [Object.<?string | Array.<?string>] Necessary path parameters.
- `options`
  - `rel` - [Boolean] Whether to generate a relative URL. Default: `false`.
  - `secure` - [Boolean] If `true` the URL will be https, if `false` will be http. Default: match the x-forwarded-proto header or the current request's connection protocol.
  - `host` - [string] Sets the host in the URL. Default: match the current request.

##Example

```js
const Hapi = require('hapi');
const hapiTo = require('hapi-to');

const server = new Hapi.Server();
server.connection({ port: 8080 });

server.route([{
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        const url = request.to('hello', {
            params: { thing: 'stitch', num: 'nine' },
            query: { page: '1' }
        });

        return reply.redirect(url);
    }
}, {
    method: 'GET',
    path: '/multi',
    handler: function (request, reply) {
        const url = request.to('rick', {
            params: { multi: ['never', 'gonna', 'give', 'you', 'up'] }
        });

        return reply.redirect(url);
    }
}, {
    method: 'GET',
    path: '/a/{thing}/in/{num}/saves/time',
    config: {
        id: 'hello',
        handler: function (request, reply) {
					return reply('You got here!');
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

server.register(hapiTo, err => {
    if (err) {
      throw err;
    }

    server.start();
});
```

If you run the above example and navigate to `http://localhost:8080/` you will be redirected to `http://localhost:8080/a/stitch/in/nine/saves/time?page=1`.

If you navigate to `http://localhost:8080/multi` you will be redirected to `http://localhost:8080/never/gonna/give/you/up`.

## Testing
First you have to install all dependencies:
```
$ npm install
```

To execute all unit tests once, use:
```
$ npm test
```

or to run tests based on file watcher, use:
```
$ npm start
```

To get information about the test coverage, use:
```
$ npm run coverage
```

## Contribution
Fork this repository and push in your ideas.

Do not forget to add corresponding tests to keep up 100% test coverage.

If you have any questions or suggestions please open an issue.
