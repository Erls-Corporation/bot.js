
var irc = require('./irc');

var bot = module.exports = irc.Client();

bot.on('ready', function() {
  console.log('CONNECTED >'.green);  
});

bot.on('joined', function(nick) {
  console.log('JOINED > '.green + nick);
  if (nick !== bot.config.nick && bot.isAdmin(nick)) {
    bot.op(nick);
  };
});

bot.on('privateMessage', function(from, message) {
  console.log('PRIVATE MESSAGE > '.green + from + ': ' + message);
});

bot.on('channelMessage', function(from, message) {
  console.log('CHANNEL MESSAGE > '.green + from + ': ' + message);
});

bot.on('command', function(from, isAdmin, command, args) {
  console.log('RECEIVED COMMAND > '.green + 'from: ' + from + ' admin?: ' + isAdmin + '. command: ' + command + ' "' + args + '"');
});

bot.on('command', function(from, isAdmin, command, args) {
  switch(command) {
    case 'topic':
      if (args === 'default') {
        bot.topic(bot.config.topic);
      } else {
        bot.topic(args);
      };
      break;
    case 'log':
      bot.logs.map(function(log) {
        bot.say(bot.config.channel, log);
      });
      break;
    case 'gtfo':
      if (isAdmin === true) {
        bot.quit('Nobody likes me! :(');
      } else {
        bot.say(bot.config.channel, "You aren't an Admin!");
      };
      break;
    case 'version':
      bot.say(bot.config.channel, 'This Bot Instance is -- ' + bot.version());
      break;
    case 'help':
      bot.say(bot.config.channel, 'Commands: !topic <topic|default>, !log, !version, !gtfo');
      break;
    default:
      bot.say(bot.config.channel, 'Unknown Command! Try !help');
  };
});

bot.on('ready', function() {
  bot.join(bot.config.channel);
});

bot.on('channelMessage', function(from, message) {
  bot.logs.push('[' + new Date() + '] ' + from + ':' + message);
});

bot.on('iEnteredChannel', function(op) {
  if (bot.config.opMe === true) {
    bot.say(bot.config.channel, 'Hey '+op+', can you op me?');
  };
});

/* EOF */