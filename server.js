var connect = require('connect')
  , http = require('http')
  , Game = require(__dirname + '/lib/game');

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('public'));

var server = app.listen(80);
Game.start(server);