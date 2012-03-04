#!/usr/bin/env node

var irc = require('../lib/irc');

var bot = new irc.Client({
  user    : 'hotch_bot',
  nick    : 'hotch_bot',
  channel : '#hotchkiss',
  server  : 'irc.freenode.net',
  port    : 6667,
  admins  : [
    'hotchkiss'
  ]
});

bot.on('ready', function() {
  console.log('connected to irc...');  
});

bot.on('joined', function(channel) {
  console.log('joined ' + channel);
});

bot.on('message', function(message) {
  console.log('received message: ' + message);
});

/* EOF */