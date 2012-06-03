var Game = function(server) {
  this.io = require('socket.io').listen(server);
  this.canvas = {width: 200, height: 200}
  this.games = [];
  this.bindListeners();
  self = this;
  this.running = setInterval(function(){self.tick()}, 100);
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
      console.log(game)
      if(typeof game === 'undefined')
        return;
      for(var i in game) {
        if(i == 0)
          continue;
        if(game[i] != socket)
          game[i].emit('opponentDisconnect');  
      }
      if(game.length != 1)
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
      shift: true,
      dead: false
   }
  } else {
    var player = { 
      snake: [[190, 190], [180, 190], [170, 190]], 
      direction: 'l', 
      gameId: game.id,
      shift: true,
      dead: false
    }
  }
  socket.set('player', player);
};

Game.prototype.findFreeGame = function(socket) {
  for(var i in this.games) {
    if(this.games[i].length < 2) {
      this.generateFood(i, [0, 1]);
      this.games[i].push(socket);
      return { id: i, newGame: false };
    }
  }
  this.games.push([socket]);
  return { id: this.games.length - 1, newGame: true };
};

Game.prototype.generateFood = function(gameId, foodIds) {
  var game = this.games[gameId];
  var init = false;
  if(game.length < 3) {
    game.unshift([]);
    init = true;
  }

  for(var i in foodIds) {
    if(typeof game[0][foodIds[i]] === 'undefined')
      game[0].push([]);
    
    var ret = [];
      while(ret.length == 0) {
      ret.push(Math.round(Math.floor(Math.random() * (this.canvas.width - 9)) / 10) * 10);
      ret.push(Math.round(Math.floor(Math.random() * (this.canvas.height - 9)) / 10) * 10);
      if(!init) {
        for(var j in game[0]) {
          var fLen = game[0][j].length - 1;
          if(game[0][j][fLen][0] == ret[0] && game[0][j][fLen][1] == ret[1])
            ret = [];
        }
      }

      for(var j in game) {
        if(j == 0)
          continue;

        for(var k in game[j]) {
          game[j].get('player', function(err, player) {
            for(var l in player.snake) {
              if(player.snake[l][0] == ret[0] && player.snake[l][1] == ret[1])
                ret = [];
            }
          });
        }
      }
    }
    game[0][foodIds[i]].push(ret)
  }
};

Game.prototype.update = function(player) {
  var c = { height: 200, width: 200 };
  var len = player.snake.length - 1;
  
  switch(player.direction) {
    case 'u':
      if(player.snake[len][1] == 0) {
        var y = c.height - 10;
      } else {
        var y = player.snake[len][1] - 10;
      }
      var x = player.snake[len][0];
    break;
    case 'd':
      if(player.snake[len][1] == (c.height - 10)) {
        var y = 0;
      } else {
        var y = player.snake[len][1] + 10;
      }
      var x = player.snake[len][0];
    break;
    case 'l':
      if(player.snake[len][0] == 0) {
        var x = c.width - 10;
      } else {
        var x = player.snake[len][0] - 10;
      }
      var y = player.snake[len][1];
    break;
    case 'r':
      if(player.snake[len][0] == (c.width - 10)) {
        var x = 0;
      } else {
        var x = player.snake[len][0] + 10;
      }
      var y = player.snake[len][1];
    break;
  }

  player.snake.push([x, y]);

  if(player.shift)
    player.snake.shift();
};

Game.prototype.checkShiftAndBite = function(player) {
  var sLen = player.snake.length - 1;
  var food = this.games[player.gameId][0];
  var shift = true;
  for(var i in food) {
    var fLen = food[i].length - 1;
    if(player.snake[sLen][0] == food[i][fLen][0] && player.snake[sLen][1] == food[i][fLen][1]) {
      this.generateFood(player.gameId, [i]);
    }

    if(player.snake[0][0] == food[i][0][0] && player.snake[0][1] == food[i][0][1]) {
      shift = false;
      food[i].shift();
    }
  }
  return shift;
};

Game.prototype.checkDeath = function(player) {
  var game = this.games[player.gameId];
  var len = player.snake.length - 1;
  for(var i in game) {
    if(i == 0)
      continue;

    game[i].get('player', function(err, otherPlayer) {
      var sLen = otherPlayer.snake.length - 1;
      for(var k = 0; k < sLen; k++ ) {
        if(player.snake[len][0] == otherPlayer.snake[k][0] && player.snake[len][1] == otherPlayer.snake[k][1]) {
          player.dead = true;
          return;
        }
      }
    });
  }
};

Game.prototype.tick = function() {
  var self = this;
  for(var i in this.games) {
    if(this.games[i].length >= 3) {
      var sockets = []
      var dataToSend = [];
      for(var j in this.games[i]) {
        if(j == 0 || typeof this.games[i][j] === 'undefined')
          continue;

        var socket = this.games[i][j];
        sockets.push(socket);
        var brk = false;
        socket.get('player', function(err, player) {
          self.checkDeath(player);

          if(player.dead) {
            brk = true;
            var game = self.games[player.gameId];
            for(var k in game) {
              if(k == 0)
                continue;
              game[k].emit('gameover');
            }
            self.games.splice(player.gameId, 1);
          } else {
            player.shift = self.checkShiftAndBite(player);
            self.update(player);
            socket.set('player', player);
            dataToSend.push({snake: player.snake[player.snake.length - 1], shift: player.shift});
          }
        });
      }
      
      if(brk)
        continue;

      var food = [];
      for(var j in this.games[i][0]) {
        var sLen = this.games[i][0][j].length - 1;
        food.push(this.games[i][0][j][sLen]);
      }

      dataToSend.unshift(food);
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