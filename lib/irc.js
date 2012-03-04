
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
  irc.emit('connected');
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
  } else if (/PRIVMSG/.test(data)) {
    if (new RegExp('PRIVMSG ' + irc.config.nick).test(data)) {
      var from = data.match(/:(.*?)!~/)[1];
      var message = data.split(' :').pop();
      irc.emit('privateMessage', from, message);
    } else if (new RegExp('PRIVMSG ' + irc.config.channel).test(data)) {
      var from = data.match(/:(.*?)!~/)[1];
      var message = data.split(' :').pop();
      irc.emit('channelMessage', from, message);
      if (message.charAt(0) === '!') {
        if (message === '!help') {
          irc.say(irc.config.channel, '!help is my only command :P');
        } else if (irc.isAdmin(from)) {
          irc.emit('command', message);
        } else {
          irc.say(irc.config.channel, 'Hey ' + from + ', you are\'re not on the list!');
        }
      };
    };
  } else if (/376/i.test(data)) {
    irc.emit('ready');
  } else if (new RegExp('JOIN ' + irc.config.channel).test(data)) {
    var nick = data.match(/:(.*?)!~/)[1];
    irc.emit('joined', nick);
    if (nick !== irc.config.nick && irc.isAdmin(nick)) {
      irc.op(nick);
    };
  } else {
    //console.log('RECV >'.green + data);
  };
};

irc.isAdmin = function(nick) {
  var result = false;
  irc.config.admins.map(function(admin) {
    if (nick === admin) {
      result = true;
    }
  });
  return result;
};

irc.raw = function(data) {
  socket.write(data + '\n', 'ascii');
};

irc.join = function(channel) {
  irc.raw('JOIN ' + channel);
};

irc.say = function(to, message) {
  irc.raw('PRIVMSG '+to+' :'+message);
};

irc.op = function(nick) {
  irc.raw('MODE '+irc.config.channel+' +o '+nick);
};

irc.on('ready', function() {
  irc.join(irc.config.channel);
});

/* EOF */