var Io = function () {
  if ( !(this instanceof Io) ) {
    return new Io()
  }
}

Io.prototype.emit = function(eventName, args) {
  console.log('socket emit: ' + eventName)
  console.log(args)
  return this
}

Io.prototype.on = function(eventName, callback) {
  //console.log('socket event: ' + eventName)
  return this
}

exports.Io = Io