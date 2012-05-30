var Game = function(server) {
  this.io = require('socket.io').listen(server);
  this.games = [];
  this.bindListeners();
  self = this;
  this.running = setInterval(function(){self.tick()}, 1000);
};

Game.prototype.bindListeners = function() {
  var self = this;
  this.io.sockets.on('connection', function(socket) {
    var player = { snake: [[0, 0], [10, 0], [20, 0]], direction: 'r' }
    socket.set('player', player);
    self.findFreeGame(socket);

    socket.on('setDirection', function(direction) {
      socket.get('player', function(err, player) {
        player.direction = direction;
        socket.set('player', player);
      });
    });
  });
};

Game.prototype.findFreeGame = function(socket) {
  for(var i in this.games) {
    if(this.games[i].length < 2) {
      this.games[i].push(socket);
      return;
    }
  }
  this.games.push([socket]);
};

Game.prototype.update = function(snake, direction) {
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
    if(this.games[i].length >= 2) {
      var sockets = []
      var dataToSend = [];
      for(var j in this.games[i]) {
        var socket = this.games[i][j];
        sockets.push(socket);
        socket.get('player', function(err, player) {
          player.snake = self.update(player.snake, player.direction);
          socket.set('player', player);
          dataToSend.push(player.snake[player.snake.length - 1]);
        });
      }

      for(var j in sockets) {
        sockets[j].emit('tick', dataToSend);
      }
    }
  }
};

Game.start = function(server) {
  return new Game(server);
};

module.exports.start = function(server) {
  Game.start(server);
};