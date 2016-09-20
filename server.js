"use strict";

var express = require('express');
var webApp = require('express')();
var webServer = require('http').Server(webApp);
var io = require('socket.io')(webServer);
var argv = require('minimist')(process.argv.slice(2));
var five = require("johnny-five");

if (argv.nodevice === true) {
  // Create a fake robot
  var robot = {};
  robot.on = function(){};
  robot.isReady = false;
} else {
  var robot = new five.Board({repl:true});
}

var SERVO_MIN = 16;
var SERVO_MAX = 105;

let leftServo;
let rightServo;
let zServo;
let leftServo2;
let rightServo2;
let zServo2;

let s1, s2, s3, s4, s5, s6;
let time = 1200;
let map;


// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

webApp.use('/', express.static(__dirname + '/site'));

io.on('connection', function (socket) {
  socket.on('angle', function (data) {
    if (robot.isReady) {
      console.log(data);
      
      if (data.tapId == "1") {            
        if (data.side == "left") {
          if (data.angle >=0 && data.angle <= 180) {
            s1.to((data.angle).map(0, 180, SERVO_MIN, SERVO_MAX), 400)
          }
        } else if (data.side == "right") {
          if (data.angle >=0 && data.angle <= 180) {
            s2.to((data.angle).map(0, 180, SERVO_MIN, SERVO_MAX), 400)
          }      
        }
      } else if (data.tapId == "2") {
        if (data.side == "left") {
          if (data.angle >=0 && data.angle <= 180) {
            s4.to((data.angle).map(0, 180, SERVO_MIN, SERVO_MAX), 400)
          }
        } else if (data.side == "right") {
          if (data.angle >=0 && data.angle <= 180) {
            s5.to((data.angle).map(0, 180, SERVO_MIN, SERVO_MAX), 400)
          }      
        }        
      }
    }
  });
});

webServer.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});

robot.on("ready", function() {
  
  // Tap #1
  s1 = new five.Servo({
    controller: "PCA9685",
    pin: 0,
    pwmRange: [500, 2500]  // servo 19.3<->105        
  });
  
  s2 = new five.Servo({
    controller: "PCA9685",
    pin: 1,
    pwmRange: [500, 2500]
  });
  
  s3 = new five.Servo({
    controller: "PCA9685",
    pin: 2,
    pwmRange: [500, 2500]
  });
  
  // Tap #2
  s4 = new five.Servo({
    controller: "PCA9685",
    pin: 12,
    pwmRange: [500, 2500]
  });
  
  s5 = new five.Servo({
    controller: "PCA9685",
    pin: 13, 
    pwmRange: [500, 2500]
  });  
    
  s6 = new five.Servo({
    controller: "PCA9685",
    pin: 14,
    pwmRange: [500, 2500]
  });      

  map = function (number, in_min , in_max , out_min , out_max ) {
    return ( number - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
  }
  
  this.repl.inject({
    s1: s1,
    s2: s2,
    s3: s3,
    s4: s4,
    s5: s5,
    s6: s6,
    map: map,
  });  
  
});

Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
  return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}

var shell = require('./shellHelper');
var video = require('./videoHelper');
var videoSocketServer = require('./videoSocketServerHelper');

let setUpCounter = 0;

const EventEmitter = require('events');
class MainServerEmitter extends EventEmitter {}
const mainServer = new MainServerEmitter();

const setUp = function(){
  shell.series([
      'adb kill-server',
      'adb start-server',
      'adb forward tcp:1717 localabstract:minicap',
      'adb forward tcp:1111 localabstract:minitouch',
  ], function(err){
     if (!err) {
       mainServer.emit('init-complete');
     } else {
       mainServer.emit('init-failed');
     }
  });
}

mainServer.on('init-complete', () => {
  process.stdout.write('Init complete!\n');
  mainServer.emit('start-video')
});

mainServer.on('init-failed', () => {
  process.stdout.write('Init failed!\n');
  if (setUpCounter < 3) {
    setUpCounter += 1;
    process.stdout.write(`Init retry #${setUpCounter} in 5 seconds...\n`);
    setTimeout(setUp, 5000);
  } else {
    process.stdout.write('Init retry failed too many times! :-(\n');
    process.stdout.write('Exiting...\n');
    process.exit(1);
  }
});

mainServer.on('start-video', () => {
  video.startVideo()
});

video.on('started', () => {
  process.stdout.write('Video started!\n');
  videoSocketServer.start()
});



process.on('SIGINT', function() {
  console.log('\nCtrl-C...\n');
  process.exit();
});

process.on('SIGTERM', function() {
  process.stdout.write('Exiting...\n');
  process.exit();
});

process.on('exit', function () {
  process.stdout.write('Exiting!\n');
  videoSocketServer.app.kill('SIGINT');
  process.exit();
});  


const main = function(){
  process.stdout.write('--------------------------------------------\n');  
  process.stdout.write('Tapster Controller v1\n');
  process.stdout.write('--------------------------------------------\n\n');  
  setUp();
}

main();

