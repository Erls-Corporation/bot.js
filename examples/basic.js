#!/usr/bin/env node

var irc = require('../lib/irc');

var bot = new irc.Client();

bot.on('ready', function() {
  console.log('CONNECTED >'.green);  
});

bot.on('joined', function(channel) {
  console.log('JOINED > '.green + channel);
});

bot.on('privateMessage', function(from, message) {
  console.log('PRIVATE MESSAGE > '.green + from + ': ' + message);
});

bot.on('channelMessage', function(from, message) {
  console.log('CHANNEL MESSAGE > '.green + from + ': ' + message);
});

bot.on('command', function(command) {
  console.log('COMMAND > '.green + command);
});

/* EOF */