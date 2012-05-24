
module.exports = function(app) {
  var socketIO;
  socketIO = require('socket.io').listen(app);
  if (!app.settings.socketIO) {
    app.set;
  }

  /*
  // Log to the console to show when a client has connected
  socketIO.sockets.on("connection", function(socket) {
    console.log('CONNECTED');
  });
  */

};
