if (typeof require !== 'undefined') {
  var tap = require('./tap')
  var util = require('../util')
}

(function(exports){
  var Sidekick = function(args) {
    this.tap0 = new tap.Tap({
      tapId: '0',
      a: {x:-108, y:-(8*4), upperArmRadius:8*9, forearmRadius:8*13},
      b: {x:-108, y:(8*4), upperArmRadius:8*9, forearmRadius:8*13},
      home: {x: -60, y:0},
      armConfig: '1'
    })
    this.tap0.parent = this

    this.tap1 = new tap.Tap({
      tapId: '1',
      a: {x:108, y:(8*4), upperArmRadius:8*9, forearmRadius:8*13},
      b: {x:108, y:-(8*4), upperArmRadius:8*9, forearmRadius:8*13},
      home: {x: 60, y:0},
      armConfig: '1'
    })
    this.tap1.parent = this

    this.tap = [this.tap0, this.tap1]

    // Need this to trigger inverse kinematics calculations
    // FIXME: Figure out how to only require calling
    //this.tap0.pointer.move(this.tap0.home.x, this.tap0.home.y)
    //this.tap0.pointer.move(this.tap0.home.x, this.tap0.home.y)
    //this.tap1.pointer.move(this.tap1.home.x, this.tap1.home.y)
  }

  exports.Sidekick = Sidekick

}(typeof exports === 'undefined' ? this.sidekick = {} : exports))