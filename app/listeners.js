var slack = require('../config/slack');
var stacy = require('./stacy');
var Standup = require('./standup');

module.exports = function() {
  stacy.addMessageListener(function(message) {
    if (message.getChannelType() == 'DM') return;
    var match = message.text.match(/^stand[-\s+]?up\s+(.+)/i);
    if (!match) return;
    var names = stacy.formatUserList(match[1]);
    if (names.length) {
      var standup = new Standup(names, message.channel, message.user);
    }
  });

  stacy.addMessageListener(function(message) {
    var match = message.text.match(/^list\s+teams?$/i);
    if (!match) return;
    var msg = [];
    stacy.getTeam(function(err, teams) {
      if (err) console.log(err);

      teams.forEach(function(team) {
        stacy.getTeam(team, function(err, members) {
          if (err) console.log(err);

          msg.push([
            '>*' + team + '*',
            '>' + members.join(', ')
          ]);
          if (msg.length == teams.length) {
            var channel = slack.getChannelGroupOrDMByID(message.channel);
            msg = msg.map(function(team) {
              return team.join('\n');
            });
            channel.send(msg.join('\n\n'));
          }
        });
      });
    });
  });

  stacy.addMessageListener(function(message) {
    var match = message.text.match(/^add team\s+([\w.-]+)\s+(.+)/i);
    if (!match) return;
    var team = match[1];
    var names = stacy.formatUserList(match[2]);
    stacy.addTeam(team, names, function(err, reply) {
      var channel = slack.getChannelGroupOrDMByID(message.channel);
      channel.send('Added _' + names.join(', ') + '_ to team *' + team + '*!');
    });
  });

  stacy.addMessageListener(function(message) {
    var match = message.text.match(/^remove team\s+([\w.-]+)\s*(.+)?/i);
    if (!match) return;
    var team = match[1];
    var names = (match[2]) ? stacy.formatUserList(match[2]) : false;
    stacy.removeTeam(team, names, function(err, reply) {
      var channel = slack.getChannelGroupOrDMByID(message.channel);
      if (names) {
        channel.send('_' + names.join('_, _') + '_ removed from team *' + team + '*.');
        return;
      }
      channel.send('Team *' + team + '* removed.');
    });
  });

  stacy.addMessageListener(function(message) {
    var match = /^h(i|ello|ey)\s+stacy$/i.test(message.text)
      || message.text == 'help' && message.getChannelType() == 'DM';
    if (!match) return;
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
      'If you started the standup, you can also end it early by typing `end standup` in the channel.',
      'To see this message again, type `hi stacy` in the channel or `/msg stacy help`'
    ];
    if (process.env.BOTMASTER) {
      help.push('Have a feature request or some feedback? Feel free to send them to me '
        + 'like this `/msg stacy feedback: Learn to sing`.');
    }
    help.push("You're awesome! Talk to you soon.");
    channel.send(help.join('\n'));
  });

  if (process.env.BOTMASTER) {
    stacy.addMessageListener(function(message) {
      if (message.getChannelType() != 'DM') return;
      var match = message.text.match(/^feedback:?(.+)/i);
      if (!match) return;
      var reply = slack.getUserByID(message.user);
      stacy.sendDM(reply, "Thanks! I've sent your feedback to my top engineers.");

      var user = slack.getUserByName('gregbot') || slack.getUserByName('g');
      stacy.sendDM(user, 'Feedback from ' + stacy.getUserStr(reply) + ': ' + match[1].trim());
    });
  } else {
    console.log('Please set environment variable BOTMASTER to enable feedback');
  }
};
