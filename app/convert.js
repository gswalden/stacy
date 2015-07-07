var parseMS = require('parse-ms');

module.exports = function(ms) {
  ms = parseMS(ms);
  var str;
  if (ms.minutes) {
    str = ms.minutes + ' minute';
    if (ms.minutes > 1) str += 's';
  } else if (ms.seconds) {
    str = ms.seconds + ' second';
    if (ms.seconds > 1) str += 's';
  } else {
    str = 'No time';
  }
  return str;
};
