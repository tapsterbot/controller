"use strict"

var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var argv = require('minimist')(process.argv.slice(2))
var five = require("johnny-five")
var tap = require('./tap-controller')
var fs = require('fs')
var math = require('mathjs')

if (argv.norobot === true) {
  // Create a fake robot
  var robot = {}
  robot.on = function(){}
  robot.isReady = false
} else {
  var robot = new five.Board({repl:true})
}

robot.device = {}
robot.simulator = {}
robot.screenTouched = false
robot.touchLocation = {}
robot.configFile = 'config.json'

if (argv.hasOwnProperty('config')) {
  if (typeof argv.config === 'string') {
    robot.configFile = argv.config
  }
}

var SERVO_MIN = 16
var SERVO_MAX = 105

let time = 1200
let map

// set the port of our application
// process.env.PORT lets the port be set by Heroku
app.use('/', express.static(__dirname + '/site'))
app.set('view engine', 'ejs')
var port = process.env.PORT || 8080
server.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port)
})

app.get('/calibrate', function(req, res) {
  res.render('calibrate')
})

io.on('connection', function (socket) {
  socket.emit('client info?')

  socket.on('client info!', function (data) {
    console.log("client info:", data)
    if (data.hasOwnProperty('type')) {
      if (data.type === 'calibrate') {
        robot.device = data
        robot.device.socket = socket
      } else if (data.type === 'simulator') {
        robot.simulator = data
        robot.simulator.socket = socket
      }
    }
  })

  socket.on('screen touch!', function (data) {
    console.log("screen touch:", data)
    robot.screenTouched = true
    robot.touchLocation = data
  })

  socket.on('arm location!', function (data) {
    console.log("arm location:", data)
    if (data.tapId == "0") {
      robot.tap0.location = {x: data.x, y: data.y}
    } if (data.tapId == "1") {
      robot.tap1.location = {x: data.x, y: data.y}
    }
  })

  socket.on('angle', function (data) {
    if (robot.isReady) {
      console.log(data)
      if (data.tapId == "0") {
        if (data.side == "left") {
          if (data.angle >=0 && data.angle <= 180) {
            robot.s1.to((data.angle).map(0, 180, SERVO_MIN, SERVO_MAX), 300)
          }
        } else if (data.side == "right") {
          if (data.angle >=0 && data.angle <= 180) {
            robot.s2.to((data.angle).map(0, 180, SERVO_MIN, SERVO_MAX), 300)
          }
        }
      } else if (data.tapId == "1") {
        if (data.side == "left") {
          if (data.angle >=0 && data.angle <= 180) {
            robot.s4.to((data.angle).map(0, 180, SERVO_MIN, SERVO_MAX), 300)
          }
        } else if (data.side == "right") {
          if (data.angle >=0 && data.angle <= 180) {
            robot.s5.to((data.angle).map(0, 180, SERVO_MIN, SERVO_MAX), 300)
          }
        }
      }
    }
  })
})

five.Board.prototype.requestArmLocation = function() {
  var socket = this.getSimulatorSocket()
  if (socket) {
    socket.emit('arm location?')
  }
}

five.Board.prototype.requestSetArmLocation = function(data) {
  var socket = this.getSimulatorSocket()
  if (socket) {
    socket.emit('arm set location!', data)
  }

}

five.Board.prototype.getTouchStatus = function() {
  return this.screenTouched
}

five.Board.prototype.setTouchStatus = function(status) {
 this.screenTouched = status
}

five.Board.prototype.getTouchLocation = function() {
  return this.touchLocation
}

five.Board.prototype.setTouchZHeight = function(value) {
  this.touchLocation.z = value
}

five.Board.prototype.getDeviceSocket = function() {
  return this.device.socket
}

five.Board.prototype.getSimulatorSocket = function() {
  return this.simulator.socket
}

five.Board.prototype.calibrate = function() {
  setTimeout(function(){ robot.tap0.calibrate() }, 0)
  setTimeout(function(){ robot.tap1.calibrate() }, 22000)
}



function Config(r) {
  this.data = {}
}

Config.prototype.toString = function() {
  if (JSON.stringify(robot.tap0.transformationMatrix) == '[]' ||
      JSON.stringify(robot.tap1.transformationMatrix) == '[]') {
    return 'ERROR: No calibration data. Try running "robot.calibrate()"'
  }
  var configData = {}

  configData.tap0 = {}
  var tm0 = robot.tap0.transformationMatrix.toArray()
  configData.tap0.transformationMatrix = {
    a: tm0[0][0],
    b: tm0[1][0],
    c: tm0[2][0],
    d: tm0[3][0]
  }
  configData.tap0.zSurface = robot.tap0.zSurface

  configData.tap1 = {}
  var tm1 = robot.tap1.transformationMatrix.toArray()
  configData.tap1.transformationMatrix = {
    a: tm1[0][0],
    b: tm1[1][0],
    c: tm1[2][0],
    d: tm1[3][0]
  }
  configData.tap1.zSurface = robot.tap1.zSurface

  return JSON.stringify(configData, null, ' ')
}

Config.prototype.save = function(file) {
  if (JSON.stringify(robot.tap0.transformationMatrix) == '[]' ||
      JSON.stringify(robot.tap1.transformationMatrix) == '[]') {
    return 'ERROR: No config data to save. Try running "robot.calibrate()"'
  }

  var configData = this.toString()

  if (file === undefined) {
   file = 'config.json'
  }

  fs.writeFileSync(file, configData, 'utf8')
}

Config.prototype.load = function(file, quiet) {
  if (file === undefined) {
   file = robot.configFile
  }

  if (!fs.existsSync(file)) {
    if (quiet === true) {
      return
    } else {
      console.log('ERROR: Config file "' + file + '" not found')
    }
  }

  try {
    var configString = fs.readFileSync(file, 'utf8')
    var config = JSON.parse(configString)

    this.data = config

    var tm0data = config.tap0.transformationMatrix
    var tm0 = [ [tm0data.a],
                [tm0data.b],
                [tm0data.c],
                [tm0data.d] ]
    robot.tap0.transformationMatrix = math.matrix(tm0)
    robot.tap0.zSurface = config.tap0.zSurface

    var tm1data = config.tap1.transformationMatrix
    var tm1 = [ [tm1data.a],
                [tm1data.b],
                [tm1data.c],
                [tm1data.d] ]
    robot.tap1.transformationMatrix = math.matrix(tm1)
    robot.tap1.zSurface = config.tap1.zSurface

  } catch (e) {
    if (quiet === true) {
      return
    } else {
      console.log('ERROR: Could not load "' + file + '"')
    }
  }
}

five.Board.prototype.config = new Config(robot)


robot.on("ready", function() {

  // Tap #1
  this.s1 = new five.Servo({
    controller: "PCA9685",
    pin: 0,
    pwmRange: [500, 2500]  // servo 19.3<->105
  })

  this.s2 = new five.Servo({
    controller: "PCA9685",
    pin: 1,
    pwmRange: [500, 2500]
  })

  this.s3 = new five.Servo({
    controller: "PCA9685",
    pin: 2,
    pwmRange: [500, 2500]
  })

  // Tap #2
  this.s4 = new five.Servo({
    controller: "PCA9685",
    pin: 12,
    pwmRange: [500, 2500]
  })

  this.s5 = new five.Servo({
    controller: "PCA9685",
    pin: 13,
    pwmRange: [500, 2500]
  })

  this.s6 = new five.Servo({
    controller: "PCA9685",
    pin: 14,
    pwmRange: [500, 2500]
  })

  map = function (number, in_min , in_max , out_min , out_max ) {
    return ( number - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min
  }

  this.tap0 = new tap.Tap({
    tapId:0,
    safePos: {x:-60, y:0},
    leftArm: this.s1,
    rightArm: this.s2,
    zArm: this.s3,
    parent: this
    })

  this.tap1 = new tap.Tap({
    tapId:1,
    safePos: {x:60, y:0},
    leftArm: this.s4,
    rightArm: this.s5,
    zArm: this.s6,
    parent: this
    })

  this.repl.inject({
    s1: this.s1,
    s2: this.s2,
    s3: this.s3,
    s4: this.s4,
    s5: this.s5,
    s6: this.s6,
    map: map,
    tap0: this.tap0,
    tap1: this.tap1,
    robot: this
  })

  this.tap0.moveToSafetyHeight()
  this.tap0.moveToSafetyPos()
  this.tap1.moveToSafetyHeight()
  this.tap1.moveToSafetyPos()
  this.config.load(robot.configFile, true)
})

Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min
}

if (argv.nophone === true) {
} else {
  var shell = require('./shellHelper')
  var video = require('./videoHelper')
  var videoSocketServer = require('./videoSocketServerHelper')

  let setUpCounter = 0

  const EventEmitter = require('events')
  class MainServerEmitter extends EventEmitter {}
  const mainServer = new MainServerEmitter()

  const setUp = function(){
    shell.series([
        'adb kill-server',
        'adb start-server',
        'adb forward tcp:1717 localabstract:minicap',
        'adb forward tcp:1111 localabstract:minitouch',
    ], function(err){
       if (!err) {
         mainServer.emit('init-complete')
       } else {
         mainServer.emit('init-failed')
       }
    })
  }

  mainServer.on('init-complete', () => {
    process.stdout.write('Init complete!\n')
    mainServer.emit('start-video')
  })

  mainServer.on('init-failed', () => {
    process.stdout.write('Init failed!\n')
    if (setUpCounter < 3) {
      setUpCounter += 1
      process.stdout.write(`Init retry #${setUpCounter} in 5 seconds...\n`)
      setTimeout(setUp, 5000)
    } else {
      process.stdout.write('Init retry failed too many times! :-(\n')
      process.stdout.write('Exiting...\n')
      process.exit(1)
    }
  })

  mainServer.on('start-video', () => {
    video.startVideo()
  })

  video.on('started', () => {
    process.stdout.write('Video started!\n')
    videoSocketServer.start()
  })



  process.on('SIGINT', function() {
    console.log('\nCtrl-C...\n')
    process.exit()
  })

  process.on('SIGTERM', function() {
    process.stdout.write('Exiting...\n')
    process.exit()
  })

  process.on('exit', function () {
    process.stdout.write('Exiting!\n')
    videoSocketServer.app.kill('SIGINT')
    process.exit()
  })


  const main = function(){
    process.stdout.write('--------------------------------------------\n')
    process.stdout.write('Tapster Controller v1\n')
    process.stdout.write('--------------------------------------------\n\n')
    setUp()
  }

  main()
}
