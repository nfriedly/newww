var config = require('../config');

// all those plugins
module.exports = [
  {
    plugin: require('crumb'),
    options: {cookieOptions: { isSecure: true }}
  },
  require('scooter'),
  {
    plugin: require('blankie'),
    options: config.csp
  },
  {
    plugin: require('../models/user'),
    options: config.couch
  },
  require('../models/registry'),
  require('../models/corporate'),
  require('../models/errors'),
  {
    plugin: require('../models/npme'),
    options: config
  },
  {
    plugin: require('../models/downloads'),
    options: config.downloads
  },
  {
    plugin: require('./bonbon'),
    options: {
      stamp: config.stamp,
      canonicalHost: config.canonicalHost,
      lang: "en_US"
    }
  }
];
