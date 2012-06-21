var check = require('validator').check;
var sanitize = require('validator').sanitize;

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var crypto = require('crypto');
var salt = 'corbenjeffjeremyroby';

var url = require('url');

/*
var Users = function(host, port) {
  this.db= new Db('houston-has-heart', new Server(host, port, { auto_reconnect: true }, {}));
  this.db.open(function(){});
};
*/

var Users = function(host, port) {

  var connectionUri = url.parse('mongodb://nodejitsu:d0530585ff2c5aea9e42e93c48d71603@flame.mongohq.com:27043/nodejitsudb330279266270');
  //onsole.log(connectionUri);
  //console.log(connectionUri.pathname.replace(/^\//, ''));

  var _parent = this;
  this.db= new Db('nodejitsudb330279266270', new Server(host, port, { auto_reconnect: true }, {}));
  this.db.open(function(error) {
    _parent.db.authenticate('nodejitsu', 'd0530585ff2c5aea9e42e93c48d71603', function(error) {
      if (error) {
        console.log(error);
      }
    });
  });
};

//var userProvider = new Users('localhost', 27017);
var userProvider = new Users('flame.mongohq.com', 27043);

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
        if (error) {
          console.log(error);
          return;
        }
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