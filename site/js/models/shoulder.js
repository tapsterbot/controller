if (typeof require !== 'undefined') {
   var Geometry = require('../../../geometry').Geometry
   var paper = new Geometry()
}

(function(exports){
  Shoulder = function(x, y, width, height, rx, ry) {
    var shoulder = paper.rect(x, y, width, height, rx, ry)
    shoulder.attr({ class: "shoulder" })
    return shoulder
  }

  exports.Shoulder = Shoulder

}(typeof exports === 'undefined' ? this.shoulder = {} : exports))