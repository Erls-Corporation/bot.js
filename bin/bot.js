#!/usr/bin/env node

var irc = require('../lib/irc');

var bot = new irc.Client();

bot.on('ready', function() {
  console.log('connected to irc...');  
});

bot.on('joined', function(channel) {
  console.log('JOINED ' + channel);
});

bot.on('privateMessage', function(from, message) {
  console.log('PRIVATE MESSAGE > %s: %s', from, message);
});

bot.on('channelMessage', function(from, message) {
  console.log('CHANNEL MESSAGE > %s: %s', from, message);
});

bot.on('command', function(command) {
  console.log('COMMAND: %s', command);
});

/* EOF */