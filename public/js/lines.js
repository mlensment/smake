$(document).ready(function() {
  var game = new Game();
});

var Game = function() {
  this.socket = io.connect('http://localhost');
  this.keyRead = false;
  this.dead = false;
  this.direction = 'r';
  this.readKey();
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
};