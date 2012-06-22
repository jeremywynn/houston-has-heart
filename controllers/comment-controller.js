var moment = require('moment');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var crypto = require('crypto');

var ObjectID = require('mongodb').ObjectID;

var commentLimit = 10;
var timeBuffer = 60;

var trimWhiteSpace = function(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

var hashtags = {
  regex: /(^#[a-zA-Z0-9]{2,})|(\s+#[a-zA-Z0-9]{2,})/g,
  linkBuilder: function(match) {
    var trimmedMatch = trimWhiteSpace(match);
    return ' <a href="/search/' + trimmedMatch.substr(1) + '">' + trimmedMatch + '</a>';
  },
  hashLinker: function(str) {
    return str.replace(this.regex, this.linkBuilder);
  },
  tagPusher: function(str) {
    var tags = [];
    str.replace(this.regex, function(match) {
      tags.push(trimWhiteSpace(match));
    });
    return tags;
  }
};

var comments = {
  formatDate: function(timestamp) {
    return moment(timestamp).format('MMMM D, YYYY');
  },
  processOutput: function(docs) {
    var decodedText;
    var hashLinkedText;
    var retrievedText;
    docs.forEach(function (item) {
      if (item.method === 'Guest') {
        // How about hhh.address().address?
        item.avatar = item.avatar + encodeURIComponent('http://houstonhasheart.jit.su/images/guest-avatar.jpg');
      }
      var retrievedText = item.text;
      var decodedText = sanitize(retrievedText).entityEncode();
      var hashLinkedText = hashtags.hashLinker(decodedText);
      item.formattedDate = comments.formatDate(item.createdAt);
      item.text = sanitize(hashLinkedText).xss();
    });
  },
  validText: /\S/
};

var hasPostedCheck = function(req) {
  var hasPosted = false;
  if (!req.session.loves) {
    req.session.loves = [];
  }

  if (!req.session.hasPosted || !req.session.auth) {
    req.session.hasPosted = false;
  }
  else {
    hasPosted = req.session.hasPosted;
  }

  return hasPosted;
};

function parseUri (str) {
  var o   = parseUri.options,
    m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
    uri = {},
    i   = 14;

  while (i--) {
    uri[o.key[i]] = m[i] || "";
  }

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) {
      uri[o.q.name][$1] = $2;
    }
  });

  return uri;
}

parseUri.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
  q:   {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

module.exports = function (hhh, socketIO, commentProvider) {

  // Handles comments by most recent -- Home
  hhh.get('/', function(req, res) {

    var conditions = { 
      approved : true
    };

    commentProvider.findComments(conditions, commentLimit, function(error, docs) {

      if (error) {
        console.log(error);
        res.end();
        return;
      }

      if (docs.length > 0) {
        comments.processOutput(docs);
      }

      res.render('index', {
        locals: {
          title: 'Houston Has Heart',
          hasPosted: hasPostedCheck(req),
          comments: docs
        }
      });

    });
  });

  // Handles querying of comments
  hhh.get('/comments', function(req, res) {

    var cleanedId = '000000000000';
    var conditions = {
      approved : true
    };

    if (req.param('cursor')) {
      cleanedId = sanitize(req.param('cursor')).xss();
      conditions._id = { $lt: new ObjectID(cleanedId) };
    }
    else if (req.param('since')) {
      // New comments
      cleanedId = sanitize(req.param('since')).xss();
      conditions._id = { $gt: new ObjectID(cleanedId) };
      commentLimit = 0;
    }
    
    commentProvider.findComments(conditions, commentLimit, function(error, docs) {

      if (error) {
        console.log(error);
        res.end();
        return;
      }

      if (docs.length > 0) {
        comments.processOutput(docs);
        res.partial('comments/comment', {
          locals: {
            comments: docs
          }
        });
      }
      else {
        res.end();
      }
    });
  });

  // Handles querying of tagged comments
  hhh.get('/comments/tagged', function(req, res) {

    var cleanedId = '000000000000';
    var conditions = { 
      approved : true,
      tags : {
        $ne : [ ]
      }
    };

    if (req.param('cursor')) {
      // More comments
      cleanedId = sanitize(req.param('cursor')).xss();
      conditions._id = { $lt: new ObjectID(cleanedId) };
    }
    else if (req.param('since')) {
      // New comments
      cleanedId = sanitize(req.param('since')).xss();
      conditions._id = { $gt: new ObjectID(cleanedId) };
      commentLimit = 0;
    }

    commentProvider.findComments(conditions, commentLimit, function(error, docs) {

      if (error) {
        console.log(error);
        res.end();
        return;
      }

      if (docs.length > 0) {
        comments.processOutput(docs);
        res.partial('comments/comment', {
          locals: {
            comments: docs
          }
        });
      }
      else {
        res.end();
      }
      /*
      if (docs.length > 0) {
        if (parseUri(req.headers.referer).host === 'hhh.ardentverve.com') {
          comments.processOutput(docs);
          res.partial('comments/comment', {
            locals: {
              comments: docs
            }
          });
        }
        else {
          res.send(docs);
        }
      }
      else {
        res.end();
      }
      */
    }); 

  });

  // Handles comments by tag
  hhh.get('/comments/tagged/:tag', function(req, res) {

    var cleanedId = '000000000000';
    var cleanedTag = sanitize(req.params.tag).xss();
    var cleanedQuery = sanitize(req.params.tag).xss();

    var searchTerms = trimWhiteSpace(cleanedQuery.replace(/ +(?= )/g,''));
    var searchTermsArray = searchTerms.split(/\s/);

    var conditionsArray = [];
    var tagsArray = [];

    searchTermsArray.forEach(function(item) {
      if (!/^#/.test(item)) {
        item = '#' + item;
      }
      tagsArray.push(item);
      conditionsArray.push({ tags: item });
    });

    var conditions = {
      $and: conditionsArray,
      approved : true
    };

    if (req.param('cursor')) {
      // More comments
      cleanedId = sanitize(req.param('cursor')).xss();
      conditions._id = { $lt: new ObjectID(cleanedId) };
    }
    else if (req.param('since')) {
      // New comments
      cleanedId = sanitize(req.param('since')).xss();
      conditions._id = { $gt: new ObjectID(cleanedId) };
      commentLimit = 0;
    }

    commentProvider.findComments(conditions, commentLimit, function(error, docs) {

      if (error) {
        console.log(error);
        res.end();
        return;
      }

      if (docs.length > 0) {
        comments.processOutput(docs);
        res.partial('comments/comment', {
          locals: {
            comments: docs
          }
        });
      }
      else {
        res.end();
      }
    });
    
  });

  // Handles getting the search page
  hhh.get('/search', function(req, res) {

    if (req.param('q')) {
      var cleanedQuery = sanitize(req.param('q')).xss();
      res.redirect('/search/' + encodeURIComponent(cleanedQuery));
    }

    else {

      var conditions = { 
        approved : true, 
        tags : { 
          $ne : [ ] 
        } 
      };

      commentProvider.findComments(conditions, commentLimit, function(error, docs) {
        if (error) {
          console.log(error);
          res.end();
          return;
        }

        comments.processOutput(docs);
        res.render('search', {
          locals: {
            comments: docs,
            title: 'Houston Has Heart',
            hasPosted: hasPostedCheck(req)
          }
        });

      });

    }

  });

  // Handles comments by tag
  hhh.get('/search/:tag', function(req, res) {

    var cleanedTag = sanitize(req.params.tag).xss();
    var cleanedQuery = sanitize(req.params.tag).xss();

    var searchTerms = trimWhiteSpace(cleanedQuery.replace(/ +(?= )/g,''));
    var searchTermsArray = searchTerms.split(/\s/);

    var conditionsArray = [];
    var tagsArray = [];

    searchTermsArray.forEach(function(item) {
      if (!/^#/.test(item)) {
        item = '#' + item;
      }
      tagsArray.push(item);
      conditionsArray.push({ tags: item });
    });

    var conditions = {
      $and: conditionsArray,
      approved : true
    };

    commentProvider.findComments(conditions, commentLimit, function(error, docs) {

      if (error) {
        console.log(error);
        res.end();
        return;
      }

      if (docs.length > 0) {
        comments.processOutput(docs);
      }
      res.render('tag', {
        locals: {
          title: 'Houston Has Heart',
          comments: docs,
          hasPosted: hasPostedCheck(req),
          tags: tagsArray
        }
      });
    });

  });

  // Handles comments by most loved
  hhh.get('/most-loved', function(req, res) {

    commentProvider.findMostLoved(function(error, docs) {

      if (error) {
        console.log(error);
        res.end();
        return;
      }

      var lovedComments = [];

      if (docs.length > 0) {
        docs.forEach(function (comment) {
          if (comment.loves !== 0) {
            lovedComments.push(comment);
          }
        });
        comments.processOutput(lovedComments);
      }
      res.render('most-loved', {
        locals: {
          title: 'Houston Has Heart',
          comments: lovedComments,
          hasPosted: hasPostedCheck(req)
        }
      });
    });

  });

  // Handles loving of comments
  hhh.post('/love', function(req, res) {

    var userLoves = req.session.loves;
    var hasLoved = true;

    if (userLoves) {
      hasLoved = false;
      for(var i = 0; i < userLoves.length; i++) {
        if (userLoves[i] === req.param('commentId')) {
          hasLoved = true;
        }
      }
    }
    else {
      res.end();
    }

    if (hasLoved === false) {
      commentProvider.saveLove(req.param('commentId'), function(error, docs) {

        if (error) {
          console.log(error);
          res.end();
          return;
        }

        req.session.loves.push(req.param('commentId'));
        socketIO.sockets.emit('loves:changed', docs);
        res.end();
      });
    }
    else {
      res.end();
    }

  });

  // Handles posting of comments
  hhh.post('/post', function(req, res) {

    var approved = false;
    var commenterName;
    var commenterIdentifier;
    var commenterImageSrc;
    var commentMethod;
    var authorLink;

    var missive = {};

    var saveComment = function() {

      if (comments.validText.test(req.param('comment')) && req.param('comment') !== 'Share something you love about H-Town...') {
        if (req.session.hasPosted === false) {
          req.session.hasPosted = true;
        }
        
        var nowDate = new Date();
        var nowTimestamp = Math.round((nowDate).getTime() / 1000);

        var conditions = { 
          identifier: commenterIdentifier,
          method: commentMethod,
          timestamp: {
            $gt: nowTimestamp - timeBuffer
          }
        };

        commentProvider.findComments(conditions, 0, function(error, docs) {

          var missive = {};

          if (docs.length > 0) {
            missive.status = 'negative';
            missive.text = 'Your comment was not submitted because not enough time has elapsed since your last submission.';
            res.send(missive);
          }
          else {
            commentProvider.save({
              text: sanitize(req.param('comment')).xss(),
              name: commenterName,
              avatar: commenterImageSrc,
              method: commentMethod,
              identifier: commenterIdentifier,
              authorLink: authorLink,
              tags: hashtags.tagPusher(req.param('comment')),
              approved: approved,
              createdAt: nowDate,
              timestamp: nowTimestamp,
              loves: 0
            }, function( error, docs) {
              if (error) {
                console.log(error);
                res.end();
                return;
              }
              if (approved) {
                socketIO.sockets.emit('comments:added', docs);
                missive.status = 'positive';
                missive.text = 'Your comment was successfully submitted.';
              }
              else {
                missive.status = 'positive';
                missive.text = 'Your comment was successfully submitted and is currently awaiting approval.';
              }
              res.send(missive);
            });

          }

        });

      }
      else {
        missive.status = 'negative';
        missive.text = 'Your comment was not submitted because no comment was written.';
        res.send(missive);
      }      
    };

    if (req.session.auth) {
      if (req.session.auth.twitter) {
        commenterImageSrc = sanitize(req.session.auth.twitter.user.profile_image_url).xss();
        commenterName = sanitize(req.session.auth.twitter.user.name).xss();
        commentMethod = 'Twitter';
        commenterIdentifier = sanitize(req.session.auth.twitter.user.screen_name).xss();
        authorLink = 'https://twitter.com/' + commenterIdentifier;
        approved = true;

        saveComment();
      }
      else if (req.session.auth.facebook) {
        commenterImageSrc = 'http://graph.facebook.com/' + sanitize(req.session.auth.facebook.user.username).xss() + '/picture';
        commenterName = sanitize(req.session.auth.facebook.user.name).xss();
        commenterIdentifier = sanitize(req.session.auth.facebook.user.username).xss();
        commentMethod = 'Facebook';
        authorLink = sanitize(req.session.auth.facebook.user.link).xss();
        approved = true;

        saveComment();
      }
    }
    // No session auth
    else if (req.param('loggedIn') === 'twitter') {
      missive.status = 'negative';
      missive.text = 'Something went wrong. Please copy your written comment and try to <a href="auth/twitter">post using Twitter</a> again or <a href="/">choose another method</a>.';
      res.send(missive);
    }
    else if (req.param('loggedIn') === 'facebook') {
      missive.status = 'negative';
      missive.text = 'Something went wrong. Please copy your written comment try to <a href="auth/facebook">post using Facebook</a> again or <a href="/">choose another method</a>.';
      res.send(missive);
    }
    else {
      var Validator = require('validator').Validator;
      var v = new Validator();
      v.error = function(msg) {
        return false;
      };

      commenterName = sanitize(req.param('name')).xss();
      commenterIdentifier = sanitize(req.param('email')).xss();

      if (comments.validText.test(commenterName) && v.check(commenterIdentifier).isEmail()) {
        commentMethod = 'Guest';
        commenterImageSrc = 'http://www.gravatar.com/avatar/' + crypto.createHash('md5').update(req.param('email')).digest('hex') + '?d=';
        saveComment();
      }
      else {
        missive.status = 'negative';
        missive.text = 'Submission failed. Please make sure you have completed all 3 fields correctly.';
        res.send(missive);
      }

    }
  });


};