/**
 * Module dependencies.
 */

var express = require('express');
var moment = require('moment');
var util = require('util');
var everyauth = require('everyauth');
var Promise = everyauth.Promise;

var hhh = module.exports = express.createServer();

// SocketIO
var socketIO = require('socket.io').listen(hhh);
//socketIO.configure('production', function() {
  socketIO.set('log level', 1);
//});

/*
if (!hhh.settings.socketIO) {
  hhh.set;
}
*/

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

everyauth.helpExpress(hhh);

// Configuration
require('./config')(hhh, everyauth);

// Models

var CommentProvider = require('./models/comments').Comments;
var commentProvider = new Comments('flame.mongohq.com', 27043);

/*
var CommentProvider = require('./models/comments').Comments;
var commentProvider = new Comments('localhost', 27017);
*/

// Controllers
require('./controllers/comment-controller')(hhh, socketIO, commentProvider);
require('./apps/admin/admin')(hhh, socketIO);
require('./apps/authentication/auth')(hhh);

// Helpers
require('./apps/helpers')(hhh);

// Routes
// Serves the About Page
hhh.get('/about', function(req, res) {
  res.render('about', {
    locals: {
      title: 'Houston Has Heart'
    }
  });
});
// Serves the Privacy Page
hhh.get('/privacy', function(req, res) {
  res.render('privacy', {
    locals: {
      title: 'Houston Has Heart'
    }
  });
});
// 404 Page
hhh.use(function(req, res, next){
  res.render('404.jade', {title: "404 - Page Not Found", showFullNav: false, status: 404, url: req.url });
});

hhh.listen(3000, function() {
  console.log("Express server listening on port %d in %s mode", hhh.address().port, hhh.settings.env);
});
