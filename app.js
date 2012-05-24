
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  //, mongoose = require('mongoose')
  //, Schema = mongoose.Schema
  , moment = require('moment')
  , crypto = require('crypto')
  //, ObjectId = Schema.ObjectId // Review necessity of this
  , RedisStore = require('connect-redis')(express);

var CommentProvider = require('./comment-provider').CommentProvider;

var app = module.exports = express.createServer();

// Configuration

//require('./apps/socket-io')(app);

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('port', 3000);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('test', function(){
  app.set('port', 3001);
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var commentProvider = new CommentProvider('localhost', 27017);

var socketIO;
socketIO = require('socket.io').listen(app);
if (!app.settings.socketIO) {
  app.set;
}

// Log to the console to show when a client has connected
socketIO.sockets.on("connection", function(socket) {
  console.log('CONNECTED');
});

/*  // This Works!
socketIO.sockets.on("connection", function(socket) {
  setTimeout(function(){
    socket.send("Hello! From your server.");
  }, 3000);
});
*/

var trimWhiteSpace = function(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

// Routes


app.get('/', function(req, res){

  //var commentProvider = new CommentProvider();
  commentProvider.findAll(function(error,docs){
    for (var i = 0; i < docs.length; i++) {
      docs[i]['formattedDate'] = moment(docs[i]['createdAt']).format('MMMM D, YYYY');
      docs[i]['email'] = trimWhiteSpace(docs[i]['email']);
      docs[i]['gravHash'] = crypto.createHash('md5').update(docs[i]['email']).digest('hex');
    }
    
    res.render('index', {
      locals: {
        title: 'Houston Has Heart',
        comments: docs
      }
    });
  });
});


app.post('/post', function(req, res){
  commentProvider.save({
    //_id: 56416546,
    text: req.param('comment'),
    name: req.param('name'),
    email: req.param('email')
  }, function( error, docs) {
    socketIO.sockets.emit('comments:changed', docs);
    res.end();
  });
});

app.post('/love', function(req, res){
  
  commentProvider.saveLove(req.param('commentId'), function(error, docs) {
    socketIO.sockets.emit('loves:changed', docs);
    res.end();
  });

});

//app.get('/', routes.index);

/*
app.get('/post', function() {
  // use the db here
});
*/

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
