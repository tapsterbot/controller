if (typeof require !== 'undefined') {
   var Geometry = require( path.resolve('geometry') ).Geometry
   var paper = new Geometry()
}

(function(exports){
  Axes = function(args) {
    this.yAxis = paper.line(0, 1000, 0, -1000)
    this.yAxis.attr({class: 'axis'})

    this.xAxis = paper.line(-500, 0, 500, 0)
    this.xAxis.attr({class: 'axis'})

    this.show = function() {
      this.xAxis.attr({visibility:"visible"})
      this.yAxis.attr({visibility:"visible"})
    }

    this.hide = function() {
      this.xAxis.attr({visibility:"hidden"})
      this.yAxis.attr({visibility:"hidden"})
    }

    this.show()
  }

  exports.Axes = Axes

}(typeof exports === 'undefined' ? this.axes = {} : exports))