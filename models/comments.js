var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var url = require('url');

Comments = function(host, port) {

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


/*

Comments = function(host, port) {
  this.db= new Db('houston-has-heart', new Server(host, port, { auto_reconnect: true }, {}));
  this.db.open(function(){});
};

*/

Comments.prototype.recentCommenters = [];

Comments.prototype.getCollection = function(callback) {
  this.db.collection('comments', function(error, collection) {
    if (error) {
      callback(error);
    }
    else {
      callback(null, collection);
    }
  });
};

Comments.prototype.findComments = function(conditions, limit, callback) {
  this.getCollection(function(error, collection) {
    if (error) {
      callback(error);
    }
    else {
      collection.find(conditions).sort({ $natural: -1 }).limit(limit).toArray(function(error, results) {
        if( error ) {
          callback(error);
        }
        else {
          callback(null, results);
        }
      });
    }
  });
};

Comments.prototype.findCommentsForAdmin = function(conditions, limit, skip, callback) {
  this.getCollection(function(error, collection) {
    if (error) {
      callback(error);
    }
    else {
      collection.find(conditions).sort({ $natural: -1 }).skip(skip).limit(limit).toArray(function(error, results) {
        if( error ) {
          callback(error);
        }
        else {
          callback(null, results);
        }
      });
    }
  });
};

Comments.prototype.findMostLoved = function(callback) {
  this.getCollection(function(error, collection) {
    if (error) {
      callback(error);
    }
    else {
      collection.find({ approved : true }, { limit: 10 }).sort({ loves: -1, $natural: -1 }).toArray(function(error, results) {
        if( error ) {
          callback(error);
        }
        else {
          callback(null, results);
        }
      });
    }
  });
};

Comments.prototype.save = function(comment, callback) {
  this.getCollection(function(error, collection) {
    if (error) {
      callback(error);
    }
    else {

      // comment.createdAt = new Date();
      // comment.timestamp = Math.round((comment.createdAt).getTime() / 1000);
      // comment.loves = 0;

      collection.insert(comment, function() {
        callback(null, comment);
      });
    }
  });
};

Comments.prototype.saveLove = function(comment, callback) {
  this.getCollection(function(error, collection) {
    if (error) {
      callback(error);
    }
    else {
      collection.findOne({ _id: new ObjectID(comment.toString()) }, function(error, result) {
        if (error) {
          callback(error);
        }
        else {
          result.loves = result.loves + 1;
          collection.update({ _id: new ObjectID(comment.toString()) }, { $set: {loves: result.loves} }, { safe: true }, function(err) {
            if (err) {
              console.warn(err.message);
            }
            callback(null, result);
          });
        }
      });
    }
  });
};

Comments.prototype.modifyApproval = function(commentId, approval, callback) {
  this.getCollection(function(error, collection) {
    if (error) {
      callback(error);
    }
    else {

      var approvalBoolean = false;

      if (approval === 'Approve') {
        approvalBoolean = true;
        approvedAt = new Date();

        collection.update({ _id: ObjectID(commentId.toString()) }, { $set: { approved: approvalBoolean, createdAt: approvedAt } }, { safe: true }, function(err) {
          if (err) {
            console.warn(err.message);
          }
          callback(null, commentId, approval);
        });

      }
      else {

        collection.update({ _id: ObjectID(commentId.toString()) }, { $set: {approved: approvalBoolean} }, { safe: true }, function(err) {
          if (err) {
            console.warn(err.message);
          }
          callback(null, commentId, approval);
        });

      }

    }
  });
};

Comments.prototype.remove = function(commentId, callback) {
  this.getCollection(function(error, collection) {
    if (error) {
      callback(error);
    }
    else {

      collection.remove({ _id: ObjectID(commentId.toString()) }, function(err) {
        if (err) {
          console.warn(err.message);
        }
        callback(null, commentId);
      });
    }
  });
};

exports.Comments = Comments;