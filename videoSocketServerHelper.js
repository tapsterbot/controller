"use strict";

const spawn = require('child_process').spawn;
const EventEmitter = require('events');
class SocketServerEmitter extends EventEmitter {
  
  constructor() {
    super();
  }  
  
  start() {
    this.app = spawn(process.execPath, ['app.js'],{
      cwd: __dirname + '/minicap/example',
      env: Object.assign({}, process.env, { PATH: process.env.PATH + ':/usr/local/bin' })
    });  
    this.app.stdout.on('data', (data) => {
     //process.stdout.write(`${data}`);
    });

    this.app.stderr.on('data', (data) => {
     //process.stderr.write(`${data}`);
    });

    this.app.on('close', (code) => {
      //process.stdout.write(`child process exited with code ${code}`);
    });
  } 
}

let socketServer = new SocketServerEmitter();

module.exports = socketServer;