var Hoek = require('hoek');
var Joi = require('joi');
var Querystring = require('qs');


exports.register = function (server, _, next) {

    server.decorate('request', 'to', function (id, params, options) {

        params = params || {};
        options = options || {};

        // Perform validation

        var paramsSchema = {
            query: Joi.object(),
            params: Joi.object()
        };

        var result = Joi.validate(params, paramsSchema);
        Hoek.assert(!result.error, result.error);
        params = result.value;

        var optionsSchema = {
            secure: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('match')).default('match'),
            rel: Joi.boolean().default(false),
            host: Joi.string()
        };

        result = Joi.validate(options, optionsSchema);
        Hoek.assert(!result.error, result.error);
        options = result.value;

        // Find the route

        var route = server.lookup(id);
        Hoek.assert(route, 'No matching route found');
        route = Hoek.clone(route);

        // Deal with params

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

        // Deal with query

        if (params.query) {
            route.path += '?' + Querystring.stringify(params.query);
        }

        if (options.rel) {
            return route.path;
        }

        // Use options

        var proto = this.headers['x-forwarded-proto'] || this.connection.info.protocol;

        if (options.secure === true) {
            proto = 'https';
        }

        if (options.secure === false) {
            proto = 'http';
        }

        return proto + '://' + (options.host || this.info.host) + route.path;
    });

    next();
};


exports.register.attributes = {
    name: 'hapi-to',
    version: require('../package').version
};
