var moment = require('moment');

var CommentProvider = require('../comment-provider').Comments;
var commentProvider = new Comments('localhost', 27017);

var comments = {
  formatDate: function(timestamp) {
    return moment(timestamp).format('MMMM D, YYYY');
  }
}

var hashtags = {
  regex: /#[a-zA-Z0-9]{2,}/g,
  linkBuilder: function(match) {
    return '<a href="/search/' + match.substr(1) + '">' + match + '</a>';
  },
  hashLinker: function(str) {
    return str.replace(this.regex, this.linkBuilder);
    //return str.replace(/(?:\s){0,1}#[a-zA-Z0-9]{2,}/g, this.linkBuilder);
  },
  tagPusher: function(str) {
    var tags = [];
    str.replace(this.regex, function(match) {
      tags.push(match);
    });
    return tags;
  }
}

module.exports = function (hhh, socketIO) {

  // Handles comments by tag
  hhh.get('/search/:tag', function(req, res) {
    commentProvider.findByTag(req.params.tag, function(error, docs) {
      if (docs.length > 0) {
        for (var i = 0; i < docs.length; i++) {
          docs[i]['formattedDate'] = comments.formatDate(docs[i]['createdAt']);
          docs[i]['text'] = hashtags.hashLinker(docs[i]['text']);
        }
      }
      res.render('tag', {
        locals: {
          title: 'Houston Has Heart',
          comments: docs,
          tag: '#' + req.params.tag
        }
      });
    });
  });

  // Handles comments by most loved
  hhh.get('/most-loved', function(req, res) {
    commentProvider.findMostLoves(function(error, docs) {
      if (docs.length > 0) {
        for (var i = 0; i < docs.length; i++) {
          docs[i]['formattedDate'] = comments.formatDate(docs[i]['createdAt']);
          docs[i]['text'] = hashtags.hashLinker(docs[i]['text']);
        }
      }
      res.render('most-loved', {
        locals: {
          title: 'Houston Has Heart',
          comments: docs
        }
      });
    });
  });

  // Handles querying of comments
  hhh.get('/query-comments', function(req, res) {
    commentProvider.loadMore(req.session.cursor, function(error, docs) {
      res.partial('comment', {
        locals: {
          comments: docs
        }
      });
    });
  });

  // Handles loving of comments
  hhh.post('/love', function(req, res) {

    //console.log(req['session']['loves']);

    var userLoves = req['session']['loves'];
    var hasLoved = false;

    for(var i = 0; i < userLoves.length; i++) {
      if (userLoves[i] === req.param('commentId')) {
        hasLoved = true;
        //console.log('hasLoved is true!');
      }
    }

    if (hasLoved === false) {
      commentProvider.saveLove(req.param('commentId'), function(error, docs) {
        req['session']['loves'].push(req.param('commentId'));
        socketIO.sockets.emit('loves:changed', docs);
        res.end();
      });
    }

  });

  // Handles posting of comments
  hhh.post('/post', function(req, res) {

    var commenterName;
    var commenterIdentifier;
    var commenterImageUrl;
    var approved = false;

    if (req.session.auth) {
      if (req.session.auth.twitter) {
        commenterImageSrc = req.session.auth.twitter.user.profile_image_url;
        commenterName = req.session.auth.twitter.user.name;
        commenterIdentifier = 'Twitter';
        approved = true;
      }
      else if (req.session.auth.facebook) {
        commenterImageSrc = 'http://graph.facebook.com/' + req.session.auth.facebook.user.username + '/picture';
        commenterName = req.session.auth.facebook.user.name;
        commenterIdentifier = 'Facebook';
        approved = true;
      }
    }
    else {
      commenterImageSrc = '/img/default-avatar.jpg';
      commenterName = req.param('name');
      commenterIdentifier = req.param('email');
    }

    commentProvider.save({
      text: req.param('comment'),
      name: commenterName,
      avatar: commenterImageSrc,
      identifier: commenterIdentifier,
      tags: hashtags.tagPusher(req.param('comment')),
      approved: approved
    }, function( error, docs) {
      if (approved) { // Is this the best way?
        socketIO.sockets.emit('comments:added', docs);
      }
      res.end();
    });
  });

  // Handles retrieving of comments
  hhh.get('/retrieve-comments', function(req, res) {
    commentProvider.loadMore(req.session.cursor, function(error, docs) {
      if (docs.length > 0) {
        req.session.cursor = docs[docs.length - 1]['_id'];
        for (var i = 0; i < docs.length; i++) {
          docs[i]['formattedDate'] = comments.formatDate(docs[i]['createdAt']);
        }
        res.partial('comment', {
          locals: {
            comments: docs
          }
        });
      }
    });
  });

  // Handles getting new comments
  hhh.get('/new-comments', function(req, res) {
    commentProvider.findSince(req.session.since, function(error, docs) {
      if (docs.length > 0) {
        req.session.since = docs[0]['_id'];
        req.session.cursor = docs[docs.length - 1]['_id'];
        for (var i = 0; i < docs.length; i++) {
          docs[i]['formattedDate'] = comments.formatDate(docs[i]['createdAt']);
          docs[i]['text'] = hashtags.hashLinker(docs[i]['text']);
        }
        res.partial('comment', {
          locals: {
            comments: docs
          }
        });
      }
    });
  });

  // Handles getting the search page
  hhh.get('/search/', function(req, res) {
    commentProvider.findByTag('#test2', function(error, docs) {
      if (docs.length > 0) {
        for (var i = 0; i < docs.length; i++) {
          docs[i]['formattedDate'] = comments.formatDate(docs[i]['createdAt']);
        }
      }
      res.render('search', {
        locals: {
          title: 'Houston Has Heart',
          comments: docs
        }
      });
    });
  });

}