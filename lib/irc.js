
require('./colors');

var fs = require('fs')
  , net = require('net')
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

irc.Client = function() {
  var file = __dirname + '/../config.json';
  irc.config = JSON.parse(fs.readFileSync(file, 'utf8'));
  socket.connect(irc.config.port, irc.config.server);
  return irc;
};

irc.listeners = [];

irc.logs = [];

irc.handle = function(data) {
  irc.testPing(data);
  irc.testConnected(data);
  irc.testPrivateMessage(data);
  irc.testIEnteredChannel(data);
  irc.testUserJoinedChannel(data);
  irc.testChannelMessage(data);
  irc.testChannelCommand(data);
  if (irc.config.logRaw === true) {
    console.log('RECV >'.green + data);
  };
};

irc.testChannelCommand = function(data) {
  var commandRE = new RegExp('PRIVMSG '+irc.config.channel+' :!')
  if (commandRE.test(data)) {
    var from = data.match(/:(.*?)!~/)[1];
    var isAdmin = irc.isAdmin(from);
    var message = data.split(' :').pop();
    var commandRE = /^!?(topic|gtfo|help|log|logs|version)/;
    var command = message.match(commandRE)[1];
    var args = message.replace(new RegExp('!'+command+' '), '');
    irc.emit('command', from, isAdmin, command, args);
  };
};

irc.testChannelMessage = function(data) {
  if (new RegExp('PRIVMSG ' + irc.config.channel).test(data)) {
    var from = data.match(/:(.*?)!~/)[1];
    var message = data.split(' :').pop();
    irc.emit('channelMessage', from, message);
  };  
};

irc.testPrivateMessage = function(data) {
  if (new RegExp('PRIVMSG ' + irc.config.nick).test(data)) {
    var from = data.match(/:(.*?)!~/)[1];
    var message = data.split(' :').pop();
    irc.emit('privateMessage', from, message); 
  }; 
};

irc.testPing = function(data) {
  if (/^PING :(.+)$/.test(data)) {
    irc.raw('PONG :' + data[1]);
  };
};

irc.testUserJoinedChannel = function(data) {
  if (new RegExp('JOIN ' + irc.config.channel).test(data)) {
    var nick = data.match(/:(.*?)!~/)[1];
    irc.emit('joined', nick);
  };
};

irc.testIEnteredChannel = function(data) {
  if (/353/.test(data)) {
    var ops = /@\w+/.exec(data)[0].replace(/@/, '');
    if (ops !== null) {
      irc.emit('iEnteredChannel', ops);
    };
  };
}

irc.testConnected = function(data) {
  if (/376/i.test(data)) {
    irc.emit('ready');
  }
};

irc.isAdmin = function(nick) {
  var result = false;
  irc.config.admins.map(function(admin) {
    if (nick === admin) {
      result = true;
    };
  });
  return result;
};

irc.version = function() {
  var file = __dirname + '/../package.json';
  var packageObj = JSON.parse(fs.readFileSync(file, 'utf8'));
  return packageObj.version;
}

irc.raw = function(data) {
  socket.write(data + '\n', 'ascii');
};

irc.join = function(channel) {
  irc.raw('JOIN ' + channel);
};

irc.part = function(channel) {
  irc.raw('PART ' + channel);
};

irc.quit = function(message) {
  irc.raw('QUIT :' + message);
}

irc.say = function(to, message) {
  irc.raw('PRIVMSG '+to+' :'+message);
};

irc.op = function(nick) {
  irc.raw('MODE '+irc.config.channel+' +o '+nick);
};

irc.topic = function(newTopic) {
  irc.raw('TOPIC '+irc.config.channel+' :'+newTopic);
};

/* EOF */