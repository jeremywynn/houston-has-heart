// Configuration Module

var express = require('express');
var everyauth = require('everyauth');
var Promise = everyauth.Promise;

module.exports = function(hhh) {
  hhh.configure(function() {
    hhh.set('views', __dirname + '/views');
    hhh.set('view engine', 'jade');
    hhh.set('port', 3000);
    hhh.use(express.bodyParser());
    hhh.use(express.methodOverride());
    hhh.use(express.cookieParser());
    hhh.use(express.session({ secret: "houstonhashearttraehsahnotsuohalwayscreativecorbenjeffjeremyroby" }));
    hhh.use(everyauth.middleware());
    hhh.use(hhh.router);
    hhh.use(express.static(__dirname + '/public'));
  });

  hhh.configure('development', function() {
    hhh.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  hhh.configure('test', function() {
    hhh.set('port', 3001);
  });

  hhh.configure('production', function() {
    hhh.use(express.errorHandler());
  });

  everyauth.twitter
    .consumerKey('bgsBEd5tZ8h3O0kOTYYO9w')
    .consumerSecret('lFe3UhUSPhG5k0Ucm0D5OYF5KeMfYTqo8bk5rIfruw4')
    .findOrCreateUser(function(session, token, secret, user) {
      var promise = this.Promise().fulfill(user);
      return promise;
    })
    .redirectPath('/');

  everyauth.facebook
    .appId('414819458549939')
    .appSecret('35da31e3f48afd8a26fcb615f2ae8a4a')
    .entryPath('/auth/facebook')
    .handleAuthCallbackError(function (req, res) {
      // If a user denies your app, Facebook will redirect the user to
      // /auth/facebook/callback?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
      // This configurable route handler defines how you want to respond to
      // that.
      // If you do not configure this, everyauth renders a default fallback
      // view notifying the user that their authentication failed and why.
    })
    .findOrCreateUser(function (session, accessToken, accessTokExtra, fbUserMetadata) {
      var promise = this.Promise().fulfill(fbUserMetadata);
      return promise;
    })
    .redirectPath('/');
    // .sendResponse(function(res,data) {
    //  res.end();
    // });

  //everyauth.helpExpress(hhh);

}