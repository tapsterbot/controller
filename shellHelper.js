// spawn a child process and execute shell command
// borrowed from https://github.com/mout/mout/ build script
// author Miller Medeiros
// released under MIT License
// version: 0.1.0 (2013/02/01)
// Source: https://gist.github.com/millermedeiros/4724047

const spawn = require('child_process').spawn;

// execute a single shell command where "cmd" is a string
exports.exec = function(cmd, cb){
    // this would be way easier on a shell/bash script :P
    var child_process = require('child_process');
    var parts = cmd.split(/\s+/g);
    var p = spawn(parts[0], parts.slice(1));
    p.on('exit', function(code){
        var err = null;
        if (code) {
            err = new Error('command "'+ cmd +'" exited with wrong status code "'+ code +'"');
            err.code = code;
            err.cmd = cmd;
        }
        if (cb) cb(err);
    });

    p.stdout.on('data', (data) => {
      process.stdout.write(`${data}`);
    });    
    p.stderr.on('data', (data) => {
      process.stderr.write(`${data}`);
    });
    p.on('close', (code) => {
      //process.stdout.write(`child process exited with code ${code}`);
    });        
};


// execute multiple commands in series
// this could be replaced by any flow control lib
exports.series = function(cmds, cb){
    var execNext = function(){
        exports.exec(cmds.shift(), function(err){
            if (err) {
                cb(err);
            } else {
                if (cmds.length) {
                  execNext();
                } else {
                  cb(null);
                }
            }
        });
    };
    execNext();
};