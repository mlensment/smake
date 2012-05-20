var Game = function(server){
  this.io = require('socket.io').listen(server);
  this.bindListeners();
};

Game.prototype.bindListeners = function(){
  var self = this;
  this.io.sockets.on('connection', function (socket) {
    console.log('client connected');
  });
};

Game.start = function(server){
  return new Game(server);
};

module.exports.start = function(server){
  Game.start(server);
};