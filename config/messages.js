var S = require('string');
var random = require('random-item');
var moment = require('moment-timezone');

var greetings = [
  'Hi {{name}}!',
  'Hello {{name}}!',
  'Hey {{name}}!'
];

var yesterdayQs = [
  'What did you work on {{day}}',
  'What did you spend time on {{day}}',
  'Which project(s) did you work on {{day}}',
  'How did {{day}} go? What did you get done',
  'I hope {{day}} was productive. What did you do'
];

var interjections = [
  'Awesome',
  'Bravo',
  'Cheers',
  'Excellent',
  'Great',
  'Nice job',
  'Perfection',
  'Very nice',
  'Way to go'
];

var todayQs = [
  'how about today',
  'what will you tackle today',
  'which project(s) will you work on today',
  'will today be similar, or what will you work on',
  'what is today\'s workload'
];

var affirmations = [
  'Sounds good.',
  'I like it!',
  'Got it.',
  'Okay.',
  'Good luck!'
];

var blockers = [
  'Finally, any blockers',
  'Anything in your way',
  'Any blockers I should know about',
  'Blockers'
];

var thanks = [
  'Thanks {{name}}!',
  'Talk to you soon {{name}}!'
];

var weekend = [
  'Have a great weekend {{name}}!',
  'Thanks {{name}}, enjoy your weekend!'
];

var confirm = [
  'I have heard from {{name}}.',
  '{{name}} has reported in.',
  '{{name}} has finished sharing with me.',
];

var messages = {};

messages.getGreeting = function(name) {
  var vals = {
    name: name,
    day: getYesterday()
  };
  return S(random(greetings) + ' ' + random(yesterdayQs) + '?').template(vals).s;
};

function getYesterday() {
  var options = [];
  const { now, yesterday } = nowAndYesterday();
  if (now.day() !== 1) {
    options.push('yesterday');
    options.push(yesterday.format('dddd'));
  } else {
    options.push('Friday');
  }
  return random(options);
}

messages.getToday = function() {
  var inter = random(interjections);
  var punc = random([',', '!']);
  var q = S(random(todayQs));
  q = (punc == '!') ? q.capitalize().s : q.s;
  return inter + punc + ' ' + q + '?';
};

messages.getBlocker = function() {
  return random(affirmations) + ' ' + random(blockers) + '?';
};

messages.getThanks = function(name) {
  var options = thanks;
  const { now } = nowAndYesterday();
  if (now.day() == 5) {
    options = options.concat(weekend);
  }
  return S(random(options)).template({ name: name }).s;
};

messages.getConfirm = function(name) {
  return S(random(confirm)).template({ name: name }).s;
};

function nowAndYesterday() {
  return {
    now: moment().tz('America/New_York'),
    yesterday: moment(now).subtract(1, 'd')
  };
}

module.exports = messages;
