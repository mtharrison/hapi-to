var Hoek = require('hoek');
var Joi = require('joi');
var Querystring = require('qs');


exports.register = function (server, options, next) {

    server.decorate('request', 'to', function (id, params, urlOptions) {

        params = params || {};
        urlOptions = urlOptions || {};

        var schema = {
            secure: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('match')).default('match'),
            rel: Joi.boolean().default(false),
            host: Joi.string()
        };

        var result = Joi.validate(urlOptions, schema);
        Hoek.assert(!result.error, result.error);
        urlOptions = result.value;

        var route = server.lookup(id);
        Hoek.assert(route, 'No matching route found');

        route = Hoek.clone(route);

        var routeParams = route.path.match(/\{\w+\*?\}/g);

        if (routeParams) {

            Hoek.assert(params.params, 'You must specify params when they\'re required in the path');
            Hoek.assert(routeParams.length === Object.keys(params.params).length, 'Incorrect number of params given');

            for (var i = 0; i < routeParams.length; i++) {
                var parts = routeParams[i].match(/\{(\w+)\*?\}/);
                var src = params.params[parts[1]];
                var dst = parts[0];
                var key =  parts[1];

                Hoek.assert(src, 'Missing param:', key);
                route.path = route.path.replace(dst, src);
            }
        }

        if (params.query) {
            route.path += '?' + Querystring.stringify(params.query);
        }

        if (urlOptions.rel) {
            return route.path;
        }

        var proto = this.headers['x-forwarded-proto'] || this.connection.info.protocol;

        if (urlOptions.secure === true) {
            proto = 'https';
        }

        if (urlOptions.secure === false) {
            proto = 'http';
        }

        return proto + '://' + (urlOptions.host || this.info.host) + route.path;
    });

    next();
};


exports.register.attributes = {
    name: 'hapi-to',
    version: require('../package').version
};
