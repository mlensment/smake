var Game = function(app){
  this.io = require('socket.io').listen(80);
  this.bindListeners();
};

Game.prototype.bindListeners = function(){
  var self = this;
  this.io.sockets.on('connection', function (socket) {
    console.log('client connected');
  });
};

Game.Start = function(app){
  return new Game(app);
};


module.exports.Start = function(app){
  Game.Start(app);
};