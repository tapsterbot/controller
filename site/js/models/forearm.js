if (typeof require !== 'undefined') {
  var Io = require( path.resolve('fake-io') ).Io
  var socket = Io()
  var Geometry = require('../../../geometry').Geometry
  var paper = new Geometry()
  var ccintersect = require('../circle-circle-intersect')
  var util = require('../util')
}

(function(exports){
  var armConfigs = util.armConfigs
  var Forearm = function(args) {
    var forearm = paper.line(args.x1,
                             args.y1,
                             args.x2,
                             args.y2)
    forearm.attr({
      class: "forearm",
      cr: args.radius,
      linkedTo: args.side + "UpperArm",
      side: args.side,
      tapId: args.tapId
    })
    forearm.parent = args.parent
    forearm.radius = args.radius

    ////////////////////////////////////////////////
    var dragForearmEvent = function(dx, dy, posx, posy) {
      // Convert the mouse/touch X and Y so that it's relative to the svg element
      var pt = svg.createSVGPoint()
      pt.x = posx
      pt.y = posy
      var transformed = pt.matrixTransform(svg.getScreenCTM().inverse())

      this.parent.parent.pointer.move(transformed.x, transformed.y)
    }

    forearm.drag(dragForearmEvent)

    forearm.move = function(posx, posy) {
      var side = this.attr('side')
      var tapId = this.attr('tapId')
      var upperArm = this.parent.upperArm

      if (side == "left") {
        points = ccintersect.circleCircleIntersection(
          this.parent.parent.a.center.x,
          this.parent.parent.a.center.y,
          upperArm.radius,
          posx,
          posy,
          this.radius)
      } else {
        points = ccintersect.circleCircleIntersection(
          this.parent.parent.b.center.x,
          this.parent.parent.b.center.y,
          upperArm.radius,
          posx,
          posy,
          this.radius
        )
      }

      if (points[0] == 1) {
        // points are inside the limit
        if (side == "left") {
          this.attr({"x2": posx,
                     "y2": posy,
                     "x1": points[1][armConfigs[this.parent.parent.armConfig][0]],
                     "y1": points[1][armConfigs[this.parent.parent.armConfig][1]]
          })
        } else {
          this.attr({"x2": posx,
                    "y2": posy,
                    "x1": points[1][armConfigs[this.parent.parent.armConfig][2]],
                    "y1": points[1][armConfigs[this.parent.parent.armConfig][3]]
          })
        }

        var armAngle = util.angle(upperArm.attr('x1').toFloat(),
                             upperArm.attr('y1').toFloat(),
                             upperArm.attr('x2').toFloat(),
                             upperArm.attr('y2').toFloat())

        if (tapId == "0") {
          if (side == "left") {
            armAngle = (armAngle*-1) + 30
            armAngle = Math.round(armAngle * 10) / 10

            upperArm.attr({"x2": points[1][armConfigs[this.parent.parent.armConfig][0]],
                          "y2": points[1][armConfigs[this.parent.parent.armConfig][1]]})
          } else {
            //console.log('right angle:' + armAngle)
            armAngle = 180 - (armAngle + 30)
            armAngle = Math.round(armAngle * 10) / 10
            //console.log('new right angle:' + armAngle)
            if (armAngle <= 0) {
              armAngle = 360 + armAngle
              //console.log('newer right angle:' + armAngle)
            }

            upperArm.attr({"x2": points[1][armConfigs[this.parent.parent.armConfig][2]],
                           "y2": points[1][armConfigs[this.parent.parent.armConfig][3]]})
          }
        } else if (tapId == "1") {
          if (side == "left") {
            //console.log('2: left angle:' + armAngle)
            if (armAngle <= 0) {
              armAngle = (armAngle*-1) - 180 + 30
              if (armAngle < 0) { armAngle = 0 }
            } else {
              armAngle = (armAngle*-1) + 30 + 180
              if (armAngle > 180) { armAngle = 180 }
            }
            armAngle = Math.round(armAngle * 10) / 10
            //console.log('2: new left angle:' + armAngle)
            upperArm.attr({"x2": points[1][armConfigs[this.parent.parent.armConfig][0]],
                          "y2": points[1][armConfigs[this.parent.parent.armConfig][1]]})
          } else {
            //console.log('right angle:' + armAngle)
            if (armAngle <= 0) {
              armAngle = (armAngle*-1) - 30
              if (armAngle < 0) { armAngle = 0 }
            } else {
              armAngle = (armAngle*-1) + 180 + 150
              if (armAngle > 180) { armAngle = 180 }
            }
            armAngle = Math.round(armAngle * 10) / 10
            //console.log('new right angle:' + armAngle)
            upperArm.attr({"x2": points[1][armConfigs[this.parent.parent.armConfig][2]],
                           "y2": points[1][armConfigs[this.parent.parent.armConfig][3]]})
          }
        }

        socket.emit('angle', {
                      tapId: this.parent.parent.tapId,
                      side: side,
                      angle: armAngle
                    })
        upperArm.attr({"angle": armAngle})

      } else {
        // points are outside the limits
        var cx = parseInt(this.attr('x1'))
        var cy = parseInt(this.attr('y1'))
        var cr = parseInt(this.attr('cr'))
        var result = util.limit(posx, posy, cx, cy, cr)
        this.attr({"x2": result.x, "y2": result.y})
        if (side == "left") {
          var result = util.limit(
            posx,
            posy,
            this.parent.parent.a.center.x,
            this.parent.parent.a.center.y,
            this.parent.parent.a.upperArm.radius
          )
        } else {
          var result = util.limit(
            posx,
            posy,
            this.parent.parent.b.center.x,
            this.parent.parent.b.center.y,
            this.parent.parent.b.upperArm.radius
          )
        }
        this.attr({"x1": result.x, "y1": result.y})
        upperArm.attr({"x2": result.x, "y2": result.y})
      }
    }
    return forearm
  }

  exports.Forearm = Forearm

}(typeof exports === 'undefined' ? this.forearm = {} : exports))