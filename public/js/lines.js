$(document).ready(function(){
  var game = new Game();
});

var Game = function() {
  this.socket = io.connect('http://localhost:80');
};