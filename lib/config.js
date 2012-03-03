
var fs = require('fs')

exports.get = function() {
  var file = __dirname + '/../config.json';
  var config = JSON.parse(fs.readFileSync(file, 'utf8'));  
  return config;
};

/* EOF */