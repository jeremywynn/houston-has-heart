/*
 * Module dependencies.
 */

var express = require('express');
var moment = require('moment');
var util = require('util');
//var everyauth = require('everyauth');
//var Promise = everyauth.Promise;

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

// Configuration
require('./config')(hhh);

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
