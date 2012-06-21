var check = require('validator').check;
var sanitize = require('validator').sanitize;

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var crypto = require('crypto');
var salt = 'corbenjeffjeremyroby';

var Users = function(host, port) {
  this.db= new Db('houston-has-heart', new Server(host, port, { auto_reconnect: true }, {}));
  this.db.open(function(){});
};

var userProvider = new Users('localhost', 27017);

Users.prototype.getCollection = function(callback) {
  this.db.collection('users', function(error, collection) {
    if (error) {
      callback(error);
    }
    else {
      callback(null, collection);
    }
  });
};

Users.prototype.verifyUser = function(username, callback) {
  this.getCollection(function(error, collection) {
    if (error) {
      callback(error);
    }
    else {
      collection.findOne({ username: username }, function(error, result) {
        if (error) {
          callback(error);
        }
        else {
          callback(null, result);
        }
      });
    }
  });
};

module.exports = function (hhh) {

  // Handles login page
  hhh.get('/login', function(req, res) {

    res.render('login', {
      locals: {
        title: 'Houston Has Heart'
      }
    });

  });

  // Handles logging in
  hhh.post('/login', function(req, res) {

    if (req.param('username') && req.param('password')) {

      var sanitizedUser = sanitize(req.param('username')).xss();
      var sanitizedPass = sanitize(req.param('password')).xss();

      var passHash = crypto.createHmac('sha256', salt).update(sanitizedPass).digest('hex');
      userProvider.verifyUser(sanitizedUser, function(error, docs) {
        if (docs && passHash === docs.password) {
          req.session.user = docs.username;
          res.redirect('/admin');
        }
        else {
          req.flash('error', 'Those credentials were incorrect! Please try again.');
          res.redirect('/login');
        }
      });
    }
    else {
      req.flash('error', 'You must supply both a username and a password to login.');
      res.redirect('/login');
    }

  });

};