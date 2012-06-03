$(document).ready(function() {
  var game = new Game();
});

var Game = function() {
  this.socket = io.connect();
  this.readKey();
  this.bindListeners();
  this.initGame();
};

Game.prototype.initGame = function() {
  this.snakes = [
    [[0, 0], [10, 0], [20, 0]], 
    [[190, 190], [180, 190], [170, 190]]
  ];
  this.status = 'WAITING'
  this.keyRead = false;
  this.draw();
  this.socket.emit('initGame');
};

Game.prototype.bindListeners = function() {
  var self = this;
  this.socket.on('tick', function(data) {
    self.status = 'RUNNING';
    self.draw(data);
  });

  this.socket.on('gameover', function(data) {
    self.status = 'GAME_OVER';
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
          if(['GAME_OVER', 'OP_DISCONNECTED'].indexOf(self.status) > -1) {
            self.initGame();
          }
        break;
      }

      if(self.status == 'RUNNING') {
        self.keyRead = true;
        self.socket.emit('setDirection', self.direction);
      }
    }

  });
};

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

    case 'GAME_OVER':
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.font = '18px Calibri';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Mäng läbi!', c.width / 2, c.height / 2.3);
      ctx.font = '10px Calibri';
      ctx.fillText('Punane uss sai 18 punkti', c.width / 2, (c.height / 2.3) + 20);
      ctx.fillText('Sinine uss sai 18 punkti', c.width / 2, (c.height / 2.3) + 40);
      ctx.fillText('Vajuta enterit, et uuesti alustada!', c.width / 2, (c.height / 2.3) + 60);
    break;

    case 'OP_DISCONNECTED':
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.font = '15px Calibri';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Vastane lahkus mängust', c.width / 2, c.height / 2.3);
      ctx.font = '10px Calibri';
      ctx.fillText('Vajuta enterit, et uuesti alustada!', c.width / 2, (c.height / 2.3) + 30);
    break;

    case 'RUNNING':
      for(var i in data) {
        if(i == 0) {
          ctx.fillStyle = 'rgb(0, 255, 0)';
          ctx.fillRect(data[i][0][0], data[i][0][1], 10, 10);
          ctx.fillRect(data[i][1][0], data[i][1][1], 10, 10);
          continue;
        }

        this.snakes[i-1].push(data[i].snake);
        if(data[i].shift)
          this.snakes[i-1].shift();
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
