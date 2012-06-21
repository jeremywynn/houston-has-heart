var moment = require('moment');
var check = require('validator').check;
var sanitize = require('validator').sanitize;

/*
var CommentProvider = require('../../models/comments').Comments;
var commentProvider = new Comments('localhost', 27017);
*/

var CommentProvider = require('../../models/comments').Comments;
var commentProvider = new Comments('flame.mongohq.com', 27043);

var comments = {
  formatDate: function(timestamp) {
    return moment(timestamp).format('MMMM D, YYYY');
  },
  processOutput: function(docs) {
    var decodedText;
    var retrievedText;
    docs.forEach(function (item) {
      retrievedText = item['text'];
      item['formattedDate'] = comments.formatDate(item['createdAt']);
      decodedText = sanitize(retrievedText).entityEncode();
      hashLinkedText = hashtags.hashLinker(decodedText);
      item['text'] = sanitize(hashLinkedText).xss();
    });
  },
  valid: /\S/
};

var trimWhiteSpace = function(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

var hashtags = {
  regex: /(^#[a-zA-Z0-9]{2,})|(\s+#[a-zA-Z0-9]{2,})/g,
  linkBuilder: function(match) {
    trimmedMatch = trimWhiteSpace(match);
    return ' <a href="/search/' + trimmedMatch.substr(1) + '">' + trimmedMatch + '</a>';
  },
  hashLinker: function(str) {
    return str.replace(this.regex, this.linkBuilder);
    //return str.replace(/(?:\s){0,1}#[a-zA-Z0-9]{2,}/g, this.linkBuilder);
  },
  tagPusher: function(str) {
    var tags = [];
    str.replace(this.regex, function(match) {
      tags.push(trimWhiteSpace(match));
    });
    return tags;
  }
};

var generatePaginator = function(pagesNeeded, commentsPerPage) {
  var page = 1;
  var pages = [];
  while (page <= pagesNeeded) {
    pages.push(page);
    page++;
  }
  return pages;
};

module.exports = function (hhh, socketIO) {

  hhh.get('/admin', function(req, res) {

    var commentsPerPage = 10;
    var conditions = {};
    var totalComments;
    var nextPage;
    var pagesNeeded = false;
    var pages;
    var prevPage;
    var skip = 0;
    var hrefFragment = '/admin';

    if (!req.session.user) {
      req.flash('error', 'You must be logged in to access this. Please login.');
      res.redirect('/login');
      return;
    }
    else if (req.session.user != 'alwayscreative') {
      req.flash('error', 'You must be logged in to access this. Please login.');
      res.redirect('/login');
      return;
    }

    if (req.param('page')) {
      skip = (req.param('page') - 1) * commentsPerPage;
    }

    commentProvider.findComments(conditions, 0, function(error, docs) {
      if (!error) {
        totalComments = docs.length;
        if (commentsPerPage > 0) {
          var firstPage;
          var lastPage;
          var nextNodes = 3;
          var nextNum = 1;
          var paginator = [];
          var prevNodes = 3;
          var requestedPageNo = 1;

          if (req.param('page')) {
            requestedPageNo = parseInt(req.param('page'));
          }

          pagesNeeded = Math.ceil(totalComments / commentsPerPage);

          if (pagesNeeded % 1 === 0 && pagesNeeded > 1) {
            pages = generatePaginator(pagesNeeded, commentsPerPage);
            if (pages.length > 1) {
              if (requestedPageNo != 1) {
                prevPage = requestedPageNo - 1;
              }
              if (requestedPageNo != pages.length) {
                nextPage = requestedPageNo + 1;
              }
            }
            while (prevNodes--) {
              var pageValue = requestedPageNo - prevNodes - 1;
              if (pageValue > 0) {
                paginator.push(pageValue);
              }
            }
            if (paginator[0] > 1) {
              paginator.unshift('...');
              firstPage = 1;
            }
            paginator.push(requestedPageNo);
            while (nextNodes--) {
              var pageValue = requestedPageNo + nextNum;
              if (pageValue < pages.length + 1) {
                paginator.push(pageValue);
              }
              nextNum++;
            }
            if (paginator[paginator.length - 1] < pages.length) {
              paginator.push('...');
              lastPage = pages[pages.length - 1];
            }
          }

        }
        commentProvider.findCommentsForAdmin(conditions, commentsPerPage, skip, function(error, docs) {
          if (error) {
            console.log(error);
            return;
          }

          if (docs.length > 0) {
            comments.processOutput(docs);
          }

          res.render('admin', {
            locals: {
              title: 'Houston Has Heart',
              comments: docs,
              currentPage: requestedPageNo,
              firstPage: firstPage,
              hrefFragment: hrefFragment,
              lastPage: lastPage,
              nextPage: nextPage,
              pages: paginator,
              prevPage: prevPage
            }
          });

        });
      }
    });
  });

  hhh.get('/admin/unapproved', function(req, res) {

    var commentsPerPage = 10;
    var totalComments;
    var nextPage;
    var pagesNeeded = false;
    var pages;
    var prevPage;
    var skip = 0;
    var hrefFragment = '/admin/unapproved';

    var conditions = { 
      approved : false
    };

    if (!req.session.user) {
      req.flash('error', 'You must be logged in to access this. Please login.');
      res.redirect('/login');
      return;
    }
    else if (req.session.user != 'alwayscreative') {
      req.flash('error', 'You must be logged in to access this. Please login.');
      res.redirect('/login');
      return;
    }

    if (req.param('page')) {
      skip = (req.param('page') - 1) * commentsPerPage;
    }

    commentProvider.findComments(conditions, 0, function(error, docs) {
      if (!error) {
        totalComments = docs.length;
        if (commentsPerPage > 0) {
          var firstPage;
          var lastPage;
          var nextNodes = 3;
          var nextNum = 1;
          var paginator = [];
          var prevNodes = 3;
          var requestedPageNo = 1;

          if (req.param('page')) {
            requestedPageNo = parseInt(req.param('page'));
          }

          pagesNeeded = Math.ceil(totalComments / commentsPerPage);

          if (pagesNeeded % 1 === 0 && pagesNeeded > 1) {
            pages = generatePaginator(pagesNeeded, commentsPerPage);
            if (pages.length > 1) {
              if (requestedPageNo != 1) {
                prevPage = requestedPageNo - 1;
              }
              if (requestedPageNo != pages.length) {
                nextPage = requestedPageNo + 1;
              }
            }
            while (prevNodes--) {
              var pageValue = requestedPageNo - prevNodes - 1;
              if (pageValue > 0) {
                paginator.push(pageValue);
              }
            }
            if (paginator[0] > 1) {
              paginator.unshift('...');
              firstPage = 1;
            }
            paginator.push(requestedPageNo);
            while (nextNodes--) {
              var pageValue = requestedPageNo + nextNum;
              if (pageValue < pages.length + 1) {
                paginator.push(pageValue);
              }
              nextNum++;
            }
            if (paginator[paginator.length - 1] < pages.length) {
              paginator.push('...');
              lastPage = pages[pages.length - 1];
            }
          }

        }
        commentProvider.findCommentsForAdmin(conditions, commentsPerPage, skip, function(error, docs) {
          if (error) {
            console.log(error);
            return;
          }

          if (docs.length > 0) {
            comments.processOutput(docs);
          }

          res.render('admin', {
            locals: {
              title: 'Houston Has Heart',
              comments: docs,
              currentPage: requestedPageNo,
              firstPage: firstPage,
              hrefFragment: hrefFragment,
              lastPage: lastPage,
              nextPage: nextPage,
              pages: paginator,
              prevPage: prevPage
            }
          });

        });
      }
    });
  });

  hhh.get('/logout-admin', function(req, res) {

    if (req.session.user) {
      delete req.session.user;
    };

    res.redirect('/');

  });

  hhh.post('/admin', function(req, res) {

    var actions = req.body;

    if (!req.session.user) {
      req.flash('error', 'You do not have permission to do this. Please login again.');
      res.redirect('/login');
      return;
    }
    else if (req.session.user != 'alwayscreative') {
      req.flash('error', 'You do not have permission to do this. Please login again.');
      res.redirect('/login');
      return;
    }

    Object.keys(actions).forEach(function(key) {
      if (actions[key] === 'Delete') {
        commentProvider.remove(key, function(error, docId) {
          if (error) {
            req.flash('error', error);
          }
        });
      }
      else {
        commentProvider.modifyApproval(key, actions[key], function(error, docId, approval) {
          if (error) {
            req.flash('error', error);
          }
        });
      }
    });
    res.redirect('/admin');
  });

};