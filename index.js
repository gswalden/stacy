var slack = require('./config/slack');
var listeners = require('./app/listeners');
var pkg = require('./package');

console.log('Loading Stacy v' + pkg.version);

slack.on('open', function() {
  console.log('Joined ' + slack.team.name + '@Slack as ' + slack.self.name);
});

slack.on('error', function(error) {
  console.error('Error', error);
});

slack.login();

listeners();
