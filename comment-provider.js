var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

CommentProvider = function(host, port) {
  this.db= new Db('houston-has-heart', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

CommentProvider.prototype.getCollection = function(callback) {
  this.db.collection('comments', function(error, comment_collection) {
    if( error ) callback(error);
    else callback(null, comment_collection);
  });
};

CommentProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, comment_collection) {
    if( error ) callback(error)
    else {
      comment_collection.find().sort({$natural:-1}).limit(2).toArray(function(error, results) {
        if( error ) callback(error)
        else callback(null, results)
      });
    }
  });
};

CommentProvider.prototype.findById = function(id, callback) {

  this.getCollection(function(error, comment_collection) {
    if (error) {
      callback(error);
    }
    else {
      comment_collection.findOne({_id: new ObjectID(id)}, function(error, result) {
        if (error) {
          callback(error);
        }
        else {
          callback(null, result);
        }
      });
    }
    /*
    if( error ) callback(error)
    else {
      comment_collection.findOne({_id: comment_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
        if( error ) callback(error)
        else callback(null, result)
      });
    }
    */
  });
};

CommentProvider.prototype.save = function(comment, callback) {
  this.getCollection(function(error, comment_collection) {
    if( error ) callback(error)
    else {

      comment.createdAt = new Date();
      comment.loves = 0;

      comment_collection.insert(comment, function() {
        callback(null, comment);
      });
    }
  });
};

CommentProvider.prototype.saveLove = function(comment, callback) {
  this.getCollection(function(error, comment_collection) {
    if( error ) callback(error)
    else {
      comment_collection.findOne({_id: new ObjectID(comment)}, function(error, result) {
        if (error) {
          callback(error);
        }
        else {
          result.loves = result.loves + 1;
          comment_collection.update({_id: new ObjectID(comment)}, {$set: {loves: result.loves}}, {safe:true}, function(err) {
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

exports.CommentProvider = CommentProvider;