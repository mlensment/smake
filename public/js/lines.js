$(document).ready(function() {
  var game = new Game();
});

var Game = function() {
  this.socket = io.connect();
  this.initGame();
  this.readKey();
  this.bindListeners();
  this.draw();
};

Game.prototype.initGame = function() {
  this.snakes = [
    [[0, 0], [10, 0], [20, 0]], 
    [[190, 190], [180, 190], [170, 190]]
  ];
  this.status = 'WAITING'
  this.keyRead = false;
  this.socket.emit('init');
};

Game.prototype.bindListeners = function() {
  var self = this;
  this.socket.on('tick', function(data) {
    self.status = 'RUNNING';
    self.draw(data);
  });

  this.socket.on('lost', function(data) {
    self.status = 'LOST';
    self.draw(data);
  });

  this.socket.on('won', function(data) {
    self.status = 'WON';
    self.draw(data);
  });

  this.socket.on('opponentDisconnect', function(data) {
    self.status = 'OP_DISCONNECTED';
    self.draw(data);
  });
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
          if(['LOST', 'WON', 'OP_DISCONNECTED'].indexOf(self.status) > -1) {
            self.initGame();
          }
        break;
      }

      if(self.status == 'RUNNING')
        self.keyRead = true;

      self.socket.emit('setDirection', self.direction);
    }

  });

  Game.prototype.draw = function(data) {
    this.keyRead = false;

    var c = document.getElementById('snake');
    var ctx = c.getContext('2d');
    c.width = c.width;

    switch(this.status) {
      case 'WAITING':
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.font = '20px Calibri';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Ootan vastast...', c.width / 2, c.height / 2);
      break;

      case 'LOST':
        console.log('you lost')
      break;

      case 'WON' :
        console.log('you won')
      break;

      case 'OP_DISCONNECTED':
        console.log('opponent disconnected')
      break;

      case 'RUNNING':
        for(var i in data) {
          this.snakes[i].push(data[i]);
        }

        for(var i in this.snakes){
          for(var j in this.snakes[i]) {
            if(i == 0) {
              ctx.fillStyle = 'rgb(255, 0, 0)';
            } else {
              ctx.fillStyle = 'rgb(0, 0, 255)';
            }
            ctx.fillRect(this.snakes[i][j][0], this.snakes[i][j][1], 10, 10);
          }
        }
      break;
    }
  };
};