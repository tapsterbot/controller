if (typeof require !== 'undefined') {
  var Geometry = require('../../../geometry').Geometry
  var paper = new Geometry()
  var ccintersect = require('../circle-circle-intersect')
  var util = require('../util')
}

(function(exports){
  var armConfigs = util.armConfigs
  var UpperArm = function(args){
    var upperarm = paper.line(args.center.x,
                              args.center.y,
                              args.center.x,
                              args.center.y - args.radius)
    upperarm.attr({
      class: "upper-arm",
      cx: args.center.x,
      cy: args.center.y,
      cr: args.radius,
      linkedTo: args.side + "Forearm",
      side: args.side,
      angle: ''
    })

    upperarm.radius = args.radius
    upperarm.parent = args.parent

    var dragUpperArmEvent = function(dx, dy, posx, posy) {
      // Convert the mouse/touch X and Y so that it's relative to the svg element
      var pt = svg.createSVGPoint()
      pt.x = posx
      pt.y = posy
      var transformed = pt.matrixTransform(svg.getScreenCTM().inverse())

      this.move(transformed.x, transformed.y)
    }

    upperarm.drag(dragUpperArmEvent)

    upperarm.move = function(posx, posy) {
      var cx = parseInt(this.attr('cx'))
      var cy = parseInt(this.attr('cy'))
      var cr = parseInt(this.attr('cr'))

      var result = util.limit(posx, posy, cx, cy, cr)
      this.attr({"x2": result.x, "y2": result.y})

      var forearm = this.parent.forearm

      var side = this.attr('side')
      if (side == "left") {
        points = ccintersect.circleCircleIntersection(parseInt(this.attr('x2')),
                              parseInt(this.attr('y2')),
                              forearm.radius,
                              parseInt(this.parent.parent.b.upperArm.attr('x2')),
                              parseInt(this.parent.parent.b.upperArm.attr('y2')),
                              forearm.radius)
      } else {
        points = ccintersect.circleCircleIntersection(parseInt(this.attr('x2')),
                              parseInt(this.attr('y2')),
                              forearm.radius,
                              parseInt(this.parent.parent.a.upperArm.attr('x2')),
                              parseInt(this.parent.parent.a.upperArm.attr('y2')),
                              forearm.radius)
      }

      if (points[0] == 1) {

        // TODO: Find out why circleCircleIntersection() returns NaN points when upperArms touch
        if (isNaN(points[1][0])) {
          return
        }

        if (side == "left") {
          forearm.attr({"x1": result.x,
                        "y1": result.y,
                        "x2": points[1][armConfigs[this.parent.parent.armConfig][0]],
                        "y2": points[1][armConfigs[this.parent.parent.armConfig][1]]
          })
          // Now move the other arm
          this.parent.parent.b.forearm.move(
            points[1][armConfigs[this.parent.parent.armConfig][0]],
            points[1][armConfigs[this.parent.parent.armConfig][1]]
          )

          // Update pointer location
          this.parent.parent.pointer.attr('cx', forearm.attr('x2'))
          this.parent.parent.pointer.attr('cy', forearm.attr('y2'))

        } else {
          // Move this arm
          forearm.attr({"x1": result.x,
                        "y1": result.y,
                        "x2": points[1][armConfigs[this.parent.parent.armConfig][2]],
                        "y2": points[1][armConfigs[this.parent.parent.armConfig][3]]
          })
          // Now move the other arm
          this.parent.parent.a.forearm.move(
            points[1][armConfigs[this.parent.parent.armConfig][2]],
            points[1][armConfigs[this.parent.parent.armConfig][3]])

          // Update pointer location
          this.parent.parent.pointer.attr('cx', forearm.attr('x2'))
          this.parent.parent.pointer.attr('cy', forearm.attr('y2'))
        }
      }
    }

    upperarm.boundary = paper.circle(
      args.center.x,
      args.center.y,
      args.radius + args.forearmRadius
    )
    upperarm.boundary.attr({ class: "boundary-circle" })
    return upperarm
  }

  exports.UpperArm = UpperArm

}(typeof exports === 'undefined' ? this.upperarm = {} : exports))