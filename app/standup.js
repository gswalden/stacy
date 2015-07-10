var slack = require('../config/slack');
var stacy = require('./stacy');
var messages = require('../config/messages');
var random = require('random-item');
var ms = require('millisecond');
var convert = require('./convert');

function Standup(names, channel, starter) {
  this.active = false;
  this.channel = slack.getChannelGroupOrDMByID(channel);
  this.starter = slack.getUserByID(starter);
  this.names = names;
  this.users = {};
  if (!stacy.activeStandups[this.channel.id]) {
    this.start();
  } else {
    this.channel.send('Standup already active.');
  }
}

Standup.prototype.start = function() {
  stacy.activeStandups[this.channel.id] = this.active = true;
  this.listeners();
  var self = this;
  var timeStr = '10 minutes';
  this.length = ms(timeStr);
  this.startTime = Date.now();
  this.endTime = this.startTime + this.length;
  setTimeout(function() {
    self.end(true);
  }, this.length);
  self.channel.send([
    'Standup has begun! _(' + timeStr + ' to respond)_',
    'Available commands: `status`, `end standup`'
  ].join('\n'));
  this.createUserObjects();
};

Standup.prototype.progress = function() {
  var timeRemain = convert(this.endTime - Date.now());
  var output = [timeRemain + ' remaining in standup.'];
  var complete = [];
  var started = [];
  var not = [];
  for (var userID in this.users) {
    var user = this.users[userID];
    if (user.complete) {
      complete.push(user);
    } else if (user.responded) {
      started.push(user);
    } else {
      not.push(user);
    }
  }
  var self = this;
  if (not.length) {
    not = not.map(function(user) {
      return stacy.getUserStr(user);
    });
    output.push('Not started: ' + not.join(', '));
  }
  if (started.length) {
    started = started.map(function(user) {
      return stacy.getUserStr(user);
    });
    output.push('Still working: ' + started.join(', '));
  }
  if (complete.length) {
    complete = complete.map(function(user) {
      return stacy.getUserStr(user);
    });
    output.push('Finished: ' + complete.join(', '));
  }
  this.channel.send(output.join('\n'));
};

Standup.prototype.end = function(timer) {
  if (!this.active) return;
  stacy.activeStandups[this.channel.id] = this.active = false;

  var uncompletes = this.getUncompletes();
  uncompletes = (uncompletes) ? ' _(did not finish: ' + uncompletes + ')_' : '';
  var str = (timer)
    ? 'Standup timer expired, here\'s what I got.'
    : 'Standup complete!';
  this.channel.send(str + uncompletes);

  var self = this;
  var q = {
    yesterday: '>*What did you work on?*',
    today: '>*What are you working on today?*',
    blockers: '>*Any blockers?*'
  };
  var response = [];
  ['yesterday', 'today', 'blockers'].forEach(function(type) {
    response.push(q[type]);
    for (var userID in self.users) {
      var user = self.users[userID];
      if (!user.responses[type].length) continue;
      var userStr = stacy.getUserStr(user);
      user.responses[type].forEach(function(message) {
        response.push('>' + userStr + ': ' + message);
      });
    }
    response = response.concat(['', '']); // break the left border "quote" formatting
  });
  self.channel.send(response.join('\n'));
};

Standup.prototype.checkComplete = function() {
  for (var userID in this.users) {
    if (!this.users[userID].complete) {
      return;
    }
  }
  this.end();
};

Standup.prototype.getUncompletes = function() {
  var uncompletes = [];
  for (var userID in this.users) {
    if (!this.users[userID].complete) {
      uncompletes.push(stacy.getUserStr(this.users[userID]));
    }
  }
  return uncompletes.join(', ');
};

Standup.prototype.listeners = function() {
  var self = this;
  stacy.addMessageListener(function(message) {
    if (!self.active || message.getChannelType() != 'DM') return;

    var user = self.users[message.user];

    if (!user.responses.yesterday.length) {
      user.responses.yesterday.push(message.text);
      user.responded = true;
      stacy.sendDM(user, messages.getToday(user.displayName));
    } else if (!user.responses.today.length) {
      user.responses.today.push(message.text);
      stacy.sendDM(user, messages.getBlocker(user.displayName));
    } else if (!user.responses.blockers.length) {
      user.responses.blockers.push(message.text);
      user.complete = true;
      stacy.sendDM(user, messages.getThanks(user.displayName));
      self.channel.send(messages.getConfirm(user.displayName));
      self.checkComplete();
    }
  });

  stacy.addMessageListener(function(message) {
    if (!self.active
      || message.getChannelType() == 'DM'
      || message.channel != self.channel.id) return;

    if (/^(end|stop)\s+stand[-\s+]?up$/i.test(message.text)) {
      if (message.user != self.starter.id) {
        self.channel.send('Only ' + stacy.getUserStr(self.starter) + ' may end standup.')
        return;
      }

      self.end();
    }
  });

  stacy.addMessageListener(function(message) {
    if (!self.active
      || message.getChannelType() == 'DM'
      || message.channel != self.channel.id) return;

    if (/^(progress|status)$/i.test(message.text)) {
      self.progress();
    }
  });
};

Standup.prototype.createUserObjects = function() {
  var self = this;
  this.names.forEach(function(name) {
    var user = slack.getUserByName(name);
    var userID = user.id;
    if (self.users[userID]) {
      return; // user already part of standup
    }
    user = self.users[userID] = {
      id: userID,
      name: name,
      displayName: (user.profile && user.profile.first_name) ? user.profile.first_name : user.name,
      responses: {
        yesterday: [],
        today: [],
        blockers: []
      },
      responded: false,
      complete: false
    };
    stacy.sendDM(user, messages.getGreeting(user.displayName));
  });
};

module.exports = Standup;
