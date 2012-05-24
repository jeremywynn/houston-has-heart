var app, assert, request;
assert = require('assert');
request = require('request');
app = require('../../app');
describe("authentication", function() {
  return describe("GET /login ", function() {
    var body;
    body = null;
    before(function(done) {
      options({
        uri: "http://localhost:" + app.settings.port + "/login"
      });
      return request(options, function(err, response, _body) {
        body = _body;
        return done();
      });
    });
    return it("has title", function() {
      return assert.hasTag(body, '//head/title', 'Hot Pie - Login');
    });
  });
});