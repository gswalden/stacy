var token = process.env.SLACK_TOKEN;
if (!token) {
  console.log('Please set environment variable SLACK_TOKEN');
  process.exit(1);
}

var Slack = require('slack-client');
var autoReconnect = true;
var autoMark = true;

module.exports = new Slack(token, autoReconnect, autoMark);
