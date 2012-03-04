
require('./colors');

var net = require('net')
  , util = require('util')
  , events = require('events')
  , EventEmitter = events.EventEmitter;

var socket = new net.Socket();

socket.setEncoding('ascii');
socket.setNoDelay();

socket.on('connect', function() {
  irc.raw('NICK ' + irc.config.nick);
  irc.raw('USER ' + irc.config.nick + ' 8 * :' + irc.config.user);
  irc.emit('ready');
});

socket.on('data', function(data) {
  data = data.split('\n');
  for (var i = 0; i < data.length; i++) {
    if (data !== '') {
      irc.handle(data[i].slice(0, -1));
    };
  };
});

var irc = module.exports = new EventEmitter();

irc.Client = function(params) {
  irc.config = params;
  socket.connect(params.port, params.server);
  return irc;
};

irc.listeners = [];

irc.handle = function(data) {
  if (/^PING :(.+)$/.test(data)) {
    irc.raw('PONG :' + data[1]);
  } else if (/:End of \/NAMES list/.test(data)) {
    var channel = data.match(/#\b[\S]*/)[0];
    irc.emit('joined', channel);
  } else if (/PRIVMSG/.test(data)) {
    if (new RegExp('PRIVMSG ' + irc.config.nick).test(data)) {
      irc.emit('privateMessage', data);
    } else if (new RegExp('PRIVMSG ' + irc.config.channel).test(data)) {
      irc.emit('channelMessage', data);
    };
  } else if (/376/i.test(data)) {
    irc.emit('ready'); 
  } else {
    console.log('RECV >'.green + data);
  };
};

irc.raw = function(data) {
  socket.write(data + '\n', 'ascii');
};

irc.join = function(channel) {
  irc.raw('JOIN ' + channel);
};

irc.on('ready', function() {
  irc.join(irc.config.channel);
});

/* EOF */