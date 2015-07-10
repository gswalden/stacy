var slack = require('./config/slack');
var listeners = require('./app/listeners');

slack.on('open', function() {
  console.log('Joined ' + slack.team.name + '@Slack as ' + slack.self.name);
});

slack.on('error', function(error) {
  console.error('Error', error);
});

slack.login();

listeners();


// Launch something for heroku
var http = require('http');
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello Stacy!\n");
});
server.listen(process.env.PORT || 8000);
