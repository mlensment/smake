var Game = function(server) {
  this.io = require('socket.io').listen(server);
  this.games = [];
  this.bindListeners();
  self = this;
  this.running = setInterval(function(){self.tick()}, 200);
};

Game.prototype.bindListeners = function() {
  var self = this;
  this.io.sockets.on('connection', function(socket) {
    socket.set('snake', [[0, 0], [10, 0], [20, 0]]);
    socket.set('direction', 'r');
    var gameId = self.findFreeGame(socket);
    socket.set('gameId', gameId);

    socket.on('setDirection', function(direction) {
      socket.direction = direction;
    });
  });
};

Game.prototype.findFreeGame = function(socket) {
  for(var i in this.games) {
    if(this.games[i].length < 2) {
      this.games[i].push(socket);
      return i;
    }
  }
  this.games.push([socket]);
  return this.games.length;
};

Game.prototype.update = function(snake) {
  var c = {height: 200, width: 200 };
  var len = snake.length - 1;
  
  switch(direction) {
    case 'u':
      if(snake[len][1] == 0){
        var y = c.height - 10;
      } else {
        var y = snake[len][1] - 10;
      }
      var x = snake[len][0];
    break;
    case 'd':
      if(snake[len][1] == (c.height - 10)) {
        var y = 0;
      } else {
        var y = snake[len][1] + 10;
      }
      var x = snake[len][0];
    break;
    case 'l':
      if(snake[len][0] == 0) {
        var x = c.width - 10;
      } else {
        var x = snake[len][0] - 10;
      }
      var y = snake[len][1];
    break;
    case 'r':
      if(snake[len][0] == (c.width - 10)) {
        var x = 0;
      } else {
        var x = snake[len][0] + 10;
      }
      var y = snake[len][1];
    break;
  }
  snake.push([x, y]);
  return snake;
};

Game.prototype.tick = function() {
  console.log('tick')
  self = this;
  for(var i in this.games) {
    //if(this.games[i].length >= 2) {
      for(var j in this.games[i]) {
        var socket = this.games[i][j];
        socket.get('snake', function(err, snake) {
          socket.set('snake', self.update(snake));
        });
        
        console.log(socket);
        //socket.emit('tick', socket.snake[socket.snake.length]);
      }
    //}
  }
};

Game.start = function(server) {
  return new Game(server);
};

module.exports.start = function(server) {
  Game.start(server);
};