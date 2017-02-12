if (typeof require !== 'undefined') {
  var Geometry = require('../../../geometry').Geometry
  var paper = new Geometry()
  var ccintersect = require('../circle-circle-intersect')
  var util = require('../util')
}

(function(exports){
  var Pointer = function(args) {
    var pointer = paper.circle(args.x, args.y, args.size)

    pointer.parent = args.parent
    pointer.attr({ class: "pointer" })

    pointer.click(function(){
      console.log('Pointer clicked!')
    })

    var dragPointerEvent = function(dx, dy, posx, posy) {
      // Convert the mouse/touch X and Y so that it's relative to the svg element
      var pt = svg.createSVGPoint()
      pt.x = posx
      pt.y = posy
      var transformed = pt.matrixTransform(svg.getScreenCTM().inverse())

      this.move(transformed.x, transformed.y)
    }

    pointer.drag(dragPointerEvent)

    pointer.move = function(posx, posy) {

      // Check for potential collision
      var intersectionPoints = this.parent.getIntersectPoints(posx, posy)
      if (intersectionPoints.length > 0) {
        console.log(intersectionPoints.length)
        //this.attr({"cx": posx, "cy": posy})
        //this.parent.a.forearm.move(posx, posy)
        //this.parent.b.forearm.move(posx, posy)
        return
      }

      // TODO: Need to rethink how to implement the concept of limits
      // Floor
      //if (posy > -10) {
      //  posy = -10
      //}

      // Ceiling
      //if (transformed.y < -109) {
      //  transformed.y = -109
      //}

      // Wall
      //if (Math.abs(transformed.x) > 110) {
      //  transformed.x = Math.abs(transformed.x) / transformed.x * 110
      //}

      // Check to see new point is outside the boundary
      var leftDistance = Math.sqrt(Math.pow(this.parent.a.center.x - posx, 2) +
                                   Math.pow(this.parent.a.center.y - posy, 2))

      // Subtract 4 from radius to keep the arm slightly bent and prevent a singularity.
      // (Yes, *the* singularity. You've been warned...)
      var inLeftCircle = (leftDistance <= this.parent.a.upperArm.radius + this.parent.a.forearm.radius - 4)

      // Check to see new point is outside the boundary
      var rightDistance = Math.sqrt(Math.pow(this.parent.b.center.x - posx, 2) +
                                    Math.pow(this.parent.b.center.y - posy, 2))

      // Subtract 4 from radius to keep the arm slightly bent and prevent a singularity.
      // (Yes, *the* singularity. You've been warned...)
      // (And, yes, it's a paradox that there could be two singularities. Best to not think about it...)
      var inRightCircle = (rightDistance <= this.parent.b.upperArm.radius + this.parent.b.forearm.radius - 4)

      if (inLeftCircle && inRightCircle) {
        this.attr({"cx": posx, "cy": posy})
        this.parent.a.forearm.move(posx, posy)
        this.parent.b.forearm.move(posx, posy)
      } else {
        if (this.attr('cy') <= 0) {
          var result = util.limit(
            posx,
            posy,
            this.parent.b.center.x,
            this.parent.b.center.y,
            this.parent.b.upperArm.radius + this.parent.b.forearm.radius - 4
          )
        } else {
          var result = util.limit(
            posx,
            posy,
            this.parent.a.center.x,
            this.parent.a.center.y,
            this.parent.a.upperArm.radius + this.parent.a.forearm.radius - 4
          )
        }
        this.attr({"cx": result.x, "cy": result.y})
        this.parent.a.forearm.move(result.x, result.y)
        this.parent.b.forearm.move(result.x, result.y)
      }
    }
    return pointer
  }

  exports.Pointer = Pointer

}(typeof exports === 'undefined' ? this.pointer = {} : exports))