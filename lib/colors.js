
['magenta','yellow','green','blue','cyan','red'].forEach(function(color) {
  var colorized = '\u001b[#m';
  String.prototype.__defineGetter__(color, function(){
    var options = {
      'cyan'    : 6,
      'magenta' : 5,
      'blue'    : 4,
      'yellow'  : 3,
      'green'   : 2,
      'red'     : 1,
      'reset'   : 0
    };
    return colorized.replace(/#/, '3'+options[color])+this+colorized.replace(/#/, 0);
  });
});

/* EOF */