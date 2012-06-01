var connect = require('connect')
  , Game = require(__dirname + '/lib/game');

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('public'));

var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
  console.log("Listening on " + port);
});
Game.start(server);