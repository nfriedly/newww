var Hoek = require('hoek'),
    Hapi = require('hapi'),
    url = require('url'),
    npmHumans = require("npm-humans");

exports.register = function(plugin, options, next) {

  plugin.ext('onPreHandler', function(request, next) {

    if (request.method !== "post") {
      return next();
    }

    if (request.payload.honey && request.payload.honey.length) {
      return next(Hapi.Error.badRequest(request.path));
    }

    delete request.payload.honey;

    return next();
  })

  plugin.ext('onPreResponse', function(request, next) {

    // Allow npm employees to view JSON context for any page
    // by adding a `?json` query parameter to the URL
    if ('json' in request.query) {
      var isNpmEmployee = Hoek.contain(npmHumans, Hoek.reach(request, "auth.credentials.name"))
      if (process.env.NODE_ENV === "dev" || isNpmEmployee) {
        var ctx = Hoek.reach(request, 'response.source.context');

        if (ctx) {
          var context = Hoek.applyToDefaults({}, ctx);

          // If the `json` param is something other than an empty string,
          // treat it as a (deep) key in the context object.
          if (request.query.json.length > 1) {
            context = Hoek.reach(context, request.query.json)
          }

          return next(context);
        }
      }
    }

    if (request.response && request.response.variety && request.response.variety.match(/view|plain/)) {
      if (options.canonicalHost) {
        if (request.url.query.page || request.url.query.q) {
          options.canonicalURL = url.resolve(options.canonicalHost, request.url.path);
        } else {
          options.canonicalURL = url.resolve(options.canonicalHost, request.url.pathname);
        }
      }
    }

    switch (request.response.variety) {
      case "view":
        request.response.source.context = Hoek.applyToDefaults(options, request.response.source.context);
        break;
      case "plain":
        if (typeof(request.response.source) === "object") {
          request.response.source = Hoek.applyToDefaults(options, request.response.source);
        }
        break;
    }

    next();
  });

  next();
};

exports.register.attributes = {
  name: 'bonbon',
  version: '1.0.0'
};
