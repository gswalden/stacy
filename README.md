# Stacy, the Slack PM

### How to run on a brand-new Mac

```sh
#1 Open Terminal

#2 Install Homebrew
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

#3 Install git & node
brew install git node

#4 clone this repo and enter the directory
cd ~/
git clone git://github.com/gswalden/stacy.git
cd ~/stacy

#5 Install node dependencies
npm install

#6 Set environment variable SLACK_TOKEN with a Slack Bot token generated at 
#  https://makerbot.slack.com/services/new/bot (replace makerbot with your Slack group), 
#  and start Stacy
SLACK_TOKEN=xoxo-abc12345679 npm start
```

### How I run Stacy 

Instead of step `#6` above, copy the token and create a new file:

```json
{
  "script": "index.js",
  "ext": "js",
  "env": {
    "BOTMASTER": "gregbot",
    "SLACK_TOKEN": "xoxo-abc12345679"
  }
}
```

Save as `nodemon.json` in the repo's root. The `BOTMASTER` field is optional and should be your Slack username.

Now, return to Terminal and simply type `gulp` to boot up the server. An added bonus of this method: any changes to any `.js` files will be detected and automatically restart the script with your new code.

### To Do
* Restructure to be used as an npm module
