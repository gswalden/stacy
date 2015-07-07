var slack = require('../config/slack');

function addMessageListener(cb) {
  slack.on('message', function(message) {
    if (!message.text) return;
    message.text = message.text.trim();
    if (!message.text) return;
    cb(message);
  });
}

function sendDM(user, message) {
  var DM = slack.getDMByName(user.name);
  if (DM) {
    DM.send(message);
    return;
  }

  slack.openDM(user.id, function(res) {
    DM = slack.getDMByID(res.channel.id);
    DM.send(message);
  });
}

function convertIDs(names) {
  if (!Array.isArray(names)) {
    console.log('names is not an array', names);
    return;
  }

  return names.map(function(name) {
    var match = name.match(/^<(\w+)>$/);
    if (match) {
      return slack.getUserByID(match[1]).name;
    }
    return name;
  });
}

function filterNames(names) {
  if (!Array.isArray(names)) {
    console.log('names is not an array', names);
    return;
  }

  return names.filter(function(name) {
    var match = name.match(/^<(\w+)>$/);
    if (match) {
      return slack.getUserByID(match[1]);
    }
    return slack.getUserByName(name);
  });
}

function getUserStr(user) {
  return '<@' + user.id + '>';
};

module.exports = {
  addMessageListener: addMessageListener,
  activeStandups: {},
  sendDM: sendDM,
  filterNames: filterNames,
  getUserStr: getUserStr,
  convertIDs: convertIDs
};
