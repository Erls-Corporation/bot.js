
bot.js
======

Configuration
=============

Either use a config object, or setup config.json:

```json
{
  "user"    : "hotch_bot",
  "nick"    : "hotch_bot",
  "server"  : "irc.freenode.net",
  "port"    : 6667,
  "channel" : "#hotchkiss",
  "admins"  : ["hotchkiss"],
  "topic"   : "This is my default Topic!",
  "opMe"    : false,
  "logRaw"  : true
}
```

Example
=======

```javascript
#!/usr/bin/env node

var bot = new require('bot-js');

/* EOF */
```

