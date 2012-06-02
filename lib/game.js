var Game = function(server) {
  this.io = require('socket.io').listen(server);
  this.canvas = {width: 200, height: 200}
  this.games = [];
  this.bindListeners();
  self = this;
  this.running = setInterval(function(){self.tick()}, 800);
};

Game.prototype.bindListeners = function() {
  var self = this;
  this.io.sockets.on('connection', function(socket) {
    socket.on('initGame', function() {
      socket.get('player', function(err, player) {
        var init = true;
        if(player)
          var init = false;
        self.resetGame(socket);
        if(init)
          self.initGame(socket);
      });
    });
  });
};

Game.prototype.initGame = function(socket) {
  socket.on('setDirection', function(direction) {
    socket.get('player', function(err, player) {
      player.direction = direction;
      socket.set('player', player);
    });
  });

  socket.on('disconnect', function() {
    socket.get('player', function(err, player) {
      var game = self.games[player.gameId];
      for(var i in game) {
        if(i == 0)
          continue;
        if(game[i] != socket)
          game[i].emit('opponentDisconnect');  
      }
      self.games.splice(player.gameId, 1);
    });
  });
};

Game.prototype.resetGame = function(socket) {
  var game = self.findFreeGame(socket);
  if(game.newGame) {
    var player = { 
      snake: [[0, 0], [10, 0], [20, 0]], 
      direction: 'r', 
      gameId: game.id,
      shift: true
   }
  } else {
    var player = { 
      snake: [[190, 190], [180, 190], [170, 190]], 
      direction: 'l', 
      gameId: game.id,
      shift: true 
    }
  }
  socket.set('player', player);
};

Game.prototype.findFreeGame = function(socket) {
  for(var i in this.games) {
    if(this.games[i].length < 2) {
      this.generateFood(i);
      this.games[i].push(socket);
      return { id: i, newGame: false };
    }
  }
  this.games.push([socket]);
  return { id: this.games.length - 1, newGame: true };
};

Game.prototype.generateFood = function(gameId) {
  if(this.games[gameId].length < 3)
    this.games[gameId].unshift([]);

  while(this.games[gameId][0].length < 2) {
    var ret = [];
    while(ret.length == 0) {
      ret.push(Math.round(Math.floor(Math.random() * (this.canvas.width - 9)) / 10) * 10);
      ret.push(Math.round(Math.floor(Math.random() * (this.canvas.height - 9)) / 10) * 10);
      if(this.games[gameId][0].length >= 1) {
        if(this.games[gameId][0][0] == ret[0] && this.games[gameId][0][1] == ret[1])
          ret = [];
      }
    }
    this.games[gameId][0].push(ret)
  }
};

Game.prototype.update = function(snake, direction) {
  var c = { height: 200, width: 200 };
  var len = snake.length - 1;
  
  switch(direction) {
    case 'u':
      if(snake[len][1] == 0) {
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
  var self = this;
  for(var i in this.games) {
    if(this.games[i].length >= 3) {
      var sockets = []
      var dataToSend = [];
      for(var j in this.games[i]) {
        if(j == 0)
          continue;

        var socket = this.games[i][j];
        sockets.push(socket);
        socket.get('player', function(err, player) {
          player.snake = self.update(player.snake, player.direction);
          socket.set('player', player);
          dataToSend.push({snake: player.snake[player.snake.length - 1], shift: player.shift});
        });
      }

      if(this.games[i][0].length < 2)
        this.generateFood(i);
          
      dataToSend.unshift(this.games[i][0]);
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