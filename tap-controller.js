//  Calibration Routine
//
//    findSurfaceLocation
//      move pointer to a position over screen
//      lower z until screen is touched
//      store z-height
//
//    findPoint1
//      move pointer to (svg) 0,-30
//      lower to screen surface
//      store location
//
//    findPoint2
//      move pointer to (svg) 0,30
//      lower to screen surface
//      store location
//
//    calcTransformationMatrix


var math = require('mathjs')

function Tap(args) {
  this.tapId = null
  this.zSurface = 60
  this.safePos = {}
  this.point1 = { robot:{}, screen:{} }
  this.point2 = { robot:{}, screen:{} }
  this.transformationMatrix = []
  this.location = {}
  this.parent = null

  if (args) {
    var keys = Object.keys(args)
    keys.forEach(function(key){
      this[key] = args[key]
    }, this)
  }
}

Tap.prototype.getArmLocation = function() {
  return this.location
}

Tap.prototype.calibrateZAxis = function() {
  this.parent.setTouchStatus(false)
  this.lowerZAxis(this)
}

Tap.prototype.lowerZAxis = function(_this) {
  var status = _this.parent.getTouchStatus()
  var servo = _this.zArm

  if (servo.position <= 60) {
    _this.zSurface = servo.position
    // _this.parent.setTouchZHeight(servo.position)
    return
  } else {
    console.log(servo.position)
  }

  if (status === true) {
    _this.zSurface = servo.position
    // _this.parent.setTouchZHeight(servo.position)
    // return _this.parent.getTouchLocation()
    return
  } else {
    servo.to(servo.position - 1)
    setTimeout(_this.lowerZAxis, 25, _this)
  }
}

Tap.prototype.moveToSurfaceHeight = function() {
  this.zArm.to(this.zSurface, 800)
}

Tap.prototype.moveToSafetyHeight = function() {
  this.zArm.to(110, 500)
}

Tap.prototype.moveToSafetyPos = function() {
  this.moveToSafetyHeight()
  this.parent.requestSetArmLocation({tapId: this.tapId, x:this.safePos.x, y:this.safePos.y})
}

Tap.prototype.findSurfaceLocation = function() {
  this.zSurface = 0
  setTimeout(function(_this){ _this.moveToSafetyHeight() }, 0, this)
  setTimeout(function(_this){ _this.moveToRawPoint(0, 30) }, 0, this)
  setTimeout(function(_this){ _this.calibrateZAxis() }, 2000, this)
  setTimeout(function(_this){ _this.moveToSafetyHeight() }, 4000, this)
}

Tap.prototype.findPoint1 = function() {
  this.point1 = { robot:{}, screen:{} }
  setTimeout(function(_this){ _this.moveToSafetyHeight() }, 0, this)
  setTimeout(function(_this){ _this.moveToRawPoint(0, -30) }, 0, this)
  setTimeout(function(_this){ _this.moveToSurfaceHeight() }, 2000, this)
  setTimeout(function(_this){
    _this.point1.robot = {x:0, y:-30}
    _this.point1.screen = _this.parent.getTouchLocation()
  }, 5000, this)
  setTimeout(function(_this){ _this.moveToSafetyHeight() }, 6000, this)
}

Tap.prototype.findPoint2 = function() {
  this.point2 = { robot:{}, screen:{} }
  setTimeout(function(_this){ _this.moveToSafetyHeight() }, 0, this)
  setTimeout(function(_this){ _this.moveToRawPoint(0, 30) }, 0, this)
  setTimeout(function(_this){ _this.moveToSurfaceHeight() }, 2000, this)
  setTimeout(function(_this){
    _this.point2.robot = {x:0, y:30}
    _this.point2.screen = _this.parent.getTouchLocation()
  }, 5000, this)
  setTimeout(function(_this){ _this.moveToSafetyHeight() }, 6000, this)
}

Tap.prototype.calcTransformationMatrix = function() {
  // Based on "How to map points between 2D coordinate systems"
  // https://msdn.microsoft.com/en-us/library/jj635757(v=vs.85).aspx

  var point1 = this.point1
  var point2 = this.point2

  if (JSON.stringify(this.point1.screen) === '{}' || JSON.stringify(this.point2.screen) === '{}') {
    console.log('Need to calibrate first. Trying running robot.tap' + this.tapId + '.calibrate()')
    return
  }

  var M = math.matrix([
    [ point1.screen.x, point1.screen.y, 1, 0],
    [-point1.screen.y, point1.screen.x, 0, 1],
    [ point2.screen.x, point2.screen.y, 1, 0],
    [-point2.screen.y, point2.screen.x, 0, 1]
  ])

  var u = math.matrix([
    [point1.robot.x],
    [point1.robot.y],
    [point2.robot.x],
    [point2.robot.y]
  ])

  var MI = math.inv(M)
  var v = math.multiply(MI, u)
  this.transformationMatrix = v
}

Tap.prototype.calibrate = function() {
  setTimeout(function(_this){ _this.findSurfaceLocation() }, 0, this)
  setTimeout(function(_this){ _this.findPoint1() }, 7000, this)
  setTimeout(function(_this){ _this.findPoint2() }, 14000, this)
  setTimeout(function(_this){ _this.calcTransformationMatrix() }, 20000, this)
  setTimeout(function(_this){ _this.moveToSafetyPos() }, 22000, this)
}


Tap.prototype.transformPoint = function(x, y) {
  if (JSON.stringify(this.transformationMatrix) === '[]' ) {
    return
  }

  var v = this.transformationMatrix
  var a = v.get([0,0])
  var b = v.get([1,0])
  var c = v.get([2,0])
  var d = v.get([3,0])

  var xprime = -1 * ( (a * x) + (b * y) + c)
  var yprime = (b * x) - (a * y) + d

  return {x: xprime, y: yprime}
}

Tap.prototype.moveToScreenPoint = function(x, y) {
  var newPt = this.transformPoint(x, y)
  if (newPt) {
    this.parent.requestSetArmLocation({tapId: this.tapId, x:newPt.x, y:newPt.y})
    this.parent.requestArmLocation()
  }
}

Tap.prototype.moveToRawPoint = function(x, y) {
  this.parent.requestSetArmLocation({tapId: this.tapId, x:x, y:y})
  this.parent.requestArmLocation()
}

module.exports.Tap = Tap


// Usage:

// tap0.calibrate()
// tap1.calibrate()

// Top left corner of screen
// tap0.moveToScreenPoint(0, 0)

// Location of circles on calibration page
// tap0.moveToScreenPoint(208, 258)
// tap1.moveToScreenPoint(203, 508)