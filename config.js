// Configuration Module

var express = require('express');
var RedisStore = require('connect-redis')(express);
var everyauth = require('everyauth');
var Promise = everyauth.Promise;

var url = require('url');

var redis = require('redis').createClient(9445, 'cod.redistogo.com');
redis.auth('d31c1b1a75eff8654ef6bf37796d3a4d', function() {
  console.log('Connected to RedisToGo!');
});

everyauth.twitter
  .consumerKey('bgsBEd5tZ8h3O0kOTYYO9w')
  .consumerSecret('lFe3UhUSPhG5k0Ucm0D5OYF5KeMfYTqo8bk5rIfruw4')
  .handleAuthCallbackError(function (req, res) {
    res.redirect('/');
  })
  .findOrCreateUser(function(session, token, secret, user) {
    var promise = this.Promise().fulfill(user);
    return promise;
  })
  .redirectPath('/');

everyauth.facebook
  .appId('414819458549939')
  .appSecret('35da31e3f48afd8a26fcb615f2ae8a4a')
  .handleAuthCallbackError(function (req, res) {
    res.redirect('/');
  })
  .findOrCreateUser(function (session, accessToken, accessTokExtra, fbUserMetadata) {
    var promise = this.Promise().fulfill(fbUserMetadata);
    return promise;
  })
  .redirectPath('/');

module.exports = function(hhh) {
  hhh.configure(function() {
    hhh.set('views', __dirname + '/views');
    hhh.set('view engine', 'jade');
    hhh.set('port', 3000);
    hhh.use(express.bodyParser());
    hhh.use(express.methodOverride());
    hhh.use(express.cookieParser());
    hhh.use(express.session({
      secret: "houstonhashearttraehsahnotsuohalwayscreativecorbenjeffjeremyroby",
      store: new RedisStore({
        client: redis
      })
    }));
    hhh.use(everyauth.middleware());
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

  everyauth.helpExpress(hhh);

}