
require('../helpers/colors');

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

irc.Client = function(params) {
  var file = __dirname + '/../config.json';
  irc.config = params || JSON.parse(fs.readFileSync(file, 'utf8'));
  socket.connect(irc.config.port, irc.config.server);
  return irc;
};

irc.listeners = [];

irc.logs = [];

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
        var command = message;
        if (command === '!help') {
          irc.say(irc.config.channel, 'Commands: !topic <topic>, !topic default, !log, !logs <Valid RegExp>, !version, !gtfo');
        } else if (irc.isAdmin(from)) {
          if (/!topic/.test(command)) {
            if (!/!topic /.test(command)) {
              irc.say(irc.config.channel, 'Format is !topic <topic>')
            } else {
              var newTopic = command.replace(/!topic /, '');
              if (newTopic === 'default') {
                irc.topic(irc.config.defaultTopic)
              } else {
                irc.topic(newTopic);
              };
            };
          } else if (command === '!log') {
            irc.logs.map(function(log) {
              irc.say(irc.config.channel, log);
            });
          } else if (/!logs/.test(command)) {
            if (command.length < 6) {
              irc.say(irc.config.channel, 'Please specify a RegExp for Searching Logs!');
            } else {
              var REString = command.replace(/!logs /, '');
              var REStringReady = REString.replace(/^\/|\/$/g, '');
              var RELogSearch = new RegExp(REStringReady, 'gmi');
              irc.logs.map(function(log) {
                if (RELogSearch.test(log) === true) {
                  irc.say(irc.config.channel, log);
                };
              });
            };  
          } else if (command === '!version') {
            irc.say(irc.config.channel, 'This Bot Instance is -- ' + irc.version());
          } else if (command === '!gtfo') {
            irc.quit('Nobody likes me! :(');
          } else {
            irc.say(irc.config.channel, 'Unknown Command! Try -- !help');
          };
          irc.emit('command', command);
        } else {
          irc.say(irc.config.channel, 'Hey ' + from + ', you\'re not on the list!');
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
    console.log('RECV >'.green + data);
  };
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
  irc.raw('TOPIC '+irc.config.channel+' '+newTopic);
};

irc.on('ready', function() {
  irc.join(irc.config.channel);
});

irc.on('joined', function(nick) {
  if (nick === irc.config.nick) {
    irc.say(irc.config.channel, 'Hey guys! Make me an Operator!');
  };
});

irc.on('channelMessage', function(from, message) {
  irc.logs.push('[' + new Date() + '] ' + from + ':' + message);
});

/* EOF */