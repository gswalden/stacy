var slack = require('./config/slack');
var messages = require('./config/messages');
var Standup = require('./app/standup');
var stacy = require('./app/stacy');

slack.on('open', function() {
  console.log('Joined ' + slack.team.name + '@Slack as ' + slack.self.name);
});

slack.on('error', function(error) {
  console.error('Error', error);
});

slack.login();

stacy.addMessageListener(function(message) {
  if (message.getChannelType() == 'DM') return;
  var match = message.text.match(/^stand[-\s+]?up\s+(.+)/i);
  if (match) {
    var names = match[1].trim()
      .replace(/,/g, ' ') // comma separators become spaces
      .replace(/@/g, '') // remove @ symbols
      .split(/\s+/);
    names = stacy.filterNames(names);
    names = stacy.convertIDs(names);
    if (names.length) {
      var standup = new Standup(names, message.channel, message.user);
    }
  }
});

stacy.addMessageListener(function(message) {
  if (/^h(i|ello|ey)\s+stacy$/i.test(message.text)
      || message.text == 'help' && message.getChannelType() == 'DM'
  ) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var help = [
      'Hi ' + user.name + "! I'm Stacy, or as they called me in the lab, PMBot.",
      'With one short command, I can automate your daily standups. Just type '
        + "`standup username1 username2 username3` _(and so on)_ in your team's "
        + "channel (don't forget to `/invite stacy` first!).",
      'Each listed team member will receive several DMs from me, asking what they did '
        + "last, what they'll do today, and what their blockers are.",
      'During standup, type `status` in the channel for time left and team progress.',
      'Once everyone responds (or the timer elapses), I will issue a report in the channel.',
      'If you started the standup, you can also end it early by typing `end standup` in the channel.'
    ];
    if (process.env.BOTMASTER) {
      help.push('Have a feature request or some feedback? Feel free to send them to me '
        + 'like this `/msg stacy feedback: Learn to sing`.',);
    }
    help.push("You're awesome! Talk to you soon.");
    channel.send(help.join('\n'));
  }
});

if (process.env.BOTMASTER) {
  stacy.addMessageListener(function(message) {
    if (message.getChannelType() != 'DM') return;
    var match = message.text.match(/^feedback:?(.+)/i);
    if (match) {
      var reply = slack.getUserByID(message.user);
      stacy.sendDM(reply, "Thanks! I've sent your feedback to my top engineers.");

      var user = slack.getUserByName('gregbot') || slack.getUserByName('g');
      stacy.sendDM(user, 'Feedback from ' + stacy.getUserStr(reply) + ': ' + match[1].trim());
    }
  });
} else {
  console.log('Please set environment variable BOTMASTER to enable feedback');
}

// Launch something for heroku
var http = require('http');
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello Stacy!\n");
});
server.listen(process.env.PORT || 8000);
