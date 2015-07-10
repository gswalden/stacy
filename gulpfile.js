var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber');

var config;
try {
  config = require('./nodemon.json');
} catch(err) {
  config = {
    script: 'index.js',
    ext: 'js',
    "env": {
      // Token from Bot's integration page
      "SLACK_TOKEN": "",
      // Developer's / Maintainer's Slack Name
      "BOTMASTER": ""
    }
  };
}

gulp.task('develop', function () {
  nodemon(config);
});

gulp.task('default', [
  'develop'
]);
