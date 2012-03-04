
bot.js
======

Example:

```javascript

#!/usr/bin/env node

var irc = require('../lib/irc');

var bot = new irc.client({
  user    : 'hotch_bot',
  nick    : 'hotch_bot',
  channel : '#hotchkiss',
  server  : 'irc.freenode.net',
  port    : 6667,
  admins  : [
    'hotchkiss'
  ]
});

irc.on('ready', function() {
  irc.log('connected to irc...');  
});

irc.on('joined', function(channel) {
  irc.log('joined ' + channel);
});

irc.on('message', function(message) {
  irc.log('received message: ' + message);
});

```