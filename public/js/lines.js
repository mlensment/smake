$(document).ready(function() {
  var game = new Game();
});

var Game = function() {
  this.socket = io.connect('http://localhost');
  this.snakes = [[[0, 0], [10, 0], [20, 0]], [[0, 0], [10, 0], [20, 0]]];
  this.keyRead = false;
  this.dead = false;
  this.direction = 'r';
  this.readKey();
  this.draw();
};

Game.prototype.readKey = function() {
  var self = this;
  $(document).keydown(function(e) {
    if(!self.keyRead) {
      switch(e.which) {
        case 38:
          if(self.direction != 'd')
            self.direction = 'u';
        break;
        case 40:
          if(self.direction != 'u')
            self.direction = 'd';
        break;
        case 37:
          if(self.direction != 'r')
            self.direction = 'l';
        break;
        case 39:
          if(self.direction != 'l')
            self.direction = 'r';
        break;
        case 13:
          if(self.dead){
            self.resetGame();
          }
        break;
      }
      if(!self.dead)
        self.keyRead = true;
      self.socket.emit('setDirection', self.direction);
    }
  });

  Game.prototype.draw = function() {
    self = this;
    this.socket.on('tick', function(data) {
      self.keyRead = false;
      for(var i in data) {
        self.snakes[i].push(data[i]);
      }
      var c = document.getElementById('snake');
      var ctx = c.getContext('2d');
      c.width = c.width;
      if(self.dead) {
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = 'rgb(255, 255, 255)';
      } else {
        for(var i in self.snakes){
          for(var j in self.snakes[i]) {
            ctx.fillRect(self.snakes[i][j][0], self.snakes[i][j][1], 10, 10);
          }
        }
      }
    });
  };
};