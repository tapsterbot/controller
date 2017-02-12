////////////////////////////////////////////////
// Utility functions
////////////////////////////////////////////////

(function(exports){

  String.prototype.toFloat = function(){
    return parseFloat(this)
  }

  Number.prototype.toFloat = function(){
    return parseFloat(this)
  }

  // Calculate the angle based on a point and the center of a cirle
  function angle(cx, cy, ex, ey) {
    var dy = ey - cy
    var dx = ex - cx
    var theta = Math.atan2(dy, dx) // range (-PI, PI]
    theta *= 180 / Math.PI // rads to degs, range (-180, 180]
    return theta
  }

  // Calculate the angle based on a point and the center of a cirle
  function angle360(cx, cy, ex, ey) {
    var theta = angle(cx, cy, ex, ey) // range (-180, 180]
    if (theta < 0) theta = 360 + theta // range [0, 360)
    return theta
  }

  // Calculate the correct length of the arm
  function limit(x, y, cx, cy, cr) {
    x = x - cx
    y = y - cy
    var radians = Math.atan2(y, x)
    return {
      x: (Math.cos(radians) * cr) + cx,
      y: (Math.sin(radians) * cr) + cy
    }
  }

  var armConfigs = {
    '1': [2,3,0,1],
    '2': [0,1,2,3],
    '3': [0,1,0,1],
    '4': [2,3,2,3]
  }

  exports.angle = angle
  exports.angle360 = angle360
  exports.limit = limit
  exports.armConfigs = armConfigs

}(typeof exports === 'undefined' ? this.util = {} : exports))