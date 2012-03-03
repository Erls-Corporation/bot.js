#!/usr/bin/env node

var irc = require('../lib/irc');

irc.on('ready', function() {
  irc.log('connected to irc...');  
});

irc.on('joined', function(channel) {
  irc.log('joined ' + channel);
});

irc.on('message', function(message) {
  irc.log('received message: ' + message);
});

irc.connect();

/* EOF */