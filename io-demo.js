var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(3000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
    function (err, data) {
      res.writeHead(200);
      res.end(data);
    });
}

io.sockets.on("connection", function(socket) {
  setTimeout(function(){
    socket.send("Hello! From your server.");
  },3000);
});

io.sockets.on("connection", function(socket) {
  socket.on('pingping', function(ping){
    socket.emit("writeStatus", ping);
  });
});