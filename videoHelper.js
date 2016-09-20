"use strict";

const spawn = require('child_process').spawn;
const EventEmitter = require('events');
class VideoEmitter extends EventEmitter {}
const video = new VideoEmitter();

video.startVideo = function(){
  const minicap = spawn('sh', ['run.sh', 'autosize'],{
    cwd: __dirname + '/minicap',
    env: Object.assign({}, process.env, { PATH: process.env.PATH + ':/usr/local/bin' })
  });
  minicap.stdout.on('data', (data) => {
    process.stdout.write(`${data}`);
    
    if (data == 'VIDEO-STARTED\n') {
      video.emit('started')
    }
  });

  minicap.stderr.on('data', (data) => {
    process.stderr.write(`${data}`);
  });

  minicap.on('close', (code) => {
    //process.stdout.write(`child process exited with code ${code}`);
  });
}  

module.exports = video;