var slack = require('../config/slack');
var URL   = require('url-parse');
var redis = require('redis');
var client;

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

function formatUserList(string) {
  var names = string.trim()
    .replace(/,/g, ' ') // comma separators become spaces
    .replace(/[@:]/g, '') // remove @: symbols
    .split(/\s+/);
  names = filterNames(names);
  names = convertIDs(names);
  return names;
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

function connect() {
  if (client) return;

  if (process.env.REDISTOGO_URL) {
    var rtg = new URL(process.env.REDISTOGO_URL);
    client = redis.createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.password);
  } else {
    client = redis.createClient();
  }

  client.on('error', function(err) {
    console.log('redis error: ', err);
  });
}

function addTeam(name, members, cb) {
  connect();
  name = name.trim().toLowerCase();
  client.sadd('team:' + name, members, cb);
  client.sadd('teams', name, redisCB);
}

function getTeam(name, cb) {
  connect();
  if (typeof name == 'function') {
    client.smembers('teams', name);
    return;
  }
  name = name.trim().toLowerCase();
  client.smembers('team:' + name, cb);
}

function redisCB(err) {
  if (err) console.log(err);
}

function removeTeam(name, members, cb) {
  connect();
  name = name.trim().toLowerCase();
  if (members) {
    client.srem('team:' + name, members, cb);
    return;
  }
  client.del('team:' + name, cb);
  client.srem('teams', name, redisCB);
}

module.exports = {
  addMessageListener: addMessageListener,
  activeStandups: {},
  formatUserList: formatUserList,
  sendDM: sendDM,
  filterNames: filterNames,
  getUserStr: getUserStr,
  convertIDs: convertIDs,
  getTeam: getTeam,
  addTeam: addTeam,
  removeTeam: removeTeam
};
