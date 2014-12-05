var Lab = require('lab'),
lab = exports.lab = Lab.script(),
describe = lab.experiment,
before = lab.before,
after = lab.after,
it = lab.test,
expect = Lab.expect;

var server, source, u = {};
var users = require('../fixtures/users'),
fakeuser = users.fakeuser,
fakeBrowse = require('../fixtures/browseData');

var username1 = 'fakeuser',
    username2 = 'fakeusercli';

before(function (done) {
  server = require('../fixtures/setupServer')(done);
  server.ext('onPreResponse', function (request, next) {
    source = request.response.source;
    if (source.context.profile) {
      var username = source.context.profile.title;
      u[username] = source.context.profile;
    }
    next();
  });
});

describe("bonbon", function() {

  before(function (done) {
    process.env.NODE_ENV = 'production';
    done();
  })

  after(function (done) {
    process.env.NODE_ENV = 'dev';
    done();
  })


  it('allows logged-in npm employees to request the view context with a `json` query param', function (done) {
    var options = {
      url: '/~' + username1 + '?json',
      credentials: users.npmEmployee
    }
    expect(process.env.NODE_ENV).to.equal("production");
    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      expect(resp.headers['content-type']).to.match(/json/);
      expect(resp.result).to.be.an.object;
      done();
    });
  });

  it('returns the whole context object if `json` has no value', function (done) {
    var options = {
      url: '/~' + username1 + '?json',
      credentials: users.npmEmployee
    }
    expect(process.env.NODE_ENV).to.equal("production");
    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      expect(resp.result.profile).to.exist;
      expect(resp.result.profile.meta).to.exist;
      done();
    });
  });

  it('returns a subset of the context if `json` has a value', function (done) {
    var options = {
      url: '/~' + username1 + '?json=profile.meta',
      credentials: users.npmEmployee
    }
    expect(process.env.NODE_ENV).to.equal("production");
    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      expect(resp.headers['content-type']).to.match(/json/);
      expect(resp.result.github).to.exist;
      expect(resp.result.twitter).to.exist;
      done();
    });
  });

  it('does not allow logged-in non-employees to request the view context', function (done) {
    var options = {
      url: '/~' + username1 + '?json',
      credentials: users.fakeuser
    }
    expect(process.env.NODE_ENV).to.equal("production");
    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      expect(resp.headers['content-type']).to.match(/html/);
      expect(source.template).to.equal('user/profile');
      done();
    });
  });

  it('does not allow anonymous users to request the view context', function (done) {
    var options = {
      url: '/~' + username1 + '?json',
      credentials: users.fakeuser
    }
    expect(process.env.NODE_ENV).to.equal("production");
    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      expect(resp.headers['content-type']).to.match(/html/);
      expect(source.template).to.equal('user/profile');
      done();
    });
  });

  it('allows anyone to request the view context if NODE_ENV is `dev`', function (done) {
    process.env.NODE_ENV = "dev";
    expect(process.env.NODE_ENV).to.equal("dev");
    var options = {
      url: '/~' + username1 + '?json',
      credentials: null
    }
    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      expect(resp.headers['content-type']).to.match(/json/);
      expect(resp.result).to.be.an.object;
      done();
    });
  });

})
