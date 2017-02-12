if (typeof require !== 'undefined') {
  var Geometry = require('../../../geometry').Geometry
  var paper = new Geometry()
  var ccintersect = require('../circle-circle-intersect')
  var cintersect = require('../circle-intersect')
  var shoulder = require('./shoulder')
  var upperarm = require('./upperarm')
  var forearm = require('./forearm')
  var pointer = require('./pointer')
  var util = require('../util')
}

(function(exports){
  var Tap = function(args) {
    this.a = {
      parent: this,
      center: {
          x: args.a.x,
          y: args.a.y
      }
    }
    this.b = {
      parent: this,
      center: {
          x: args.b.x,
          y: args.b.y
      }
    }
    this.home = {
      x: args.home.x,
      y: args.home.y
    }

    this.tapId = args.tapId

    this.armConfig = args.armConfig

    this.a.shoulder = new shoulder.Shoulder(args.a.x-20, args.a.y-20, 40, 40, 5, 5)
    this.b.shoulder = new shoulder.Shoulder(args.b.x-20, args.b.y-20, 40, 40, 5, 5)

    this.a.upperArm = new upperarm.UpperArm({
      parent: this.a,
      side: 'left',
      tapId: args.tapId,
      radius: args.a.upperArmRadius,
      forearmRadius: args.a.forearmRadius,
      center: {
        x: args.a.x,
        y: args.a.y
    }})
    this.a.forearm = new forearm.Forearm({
      parent: this.a,
      side: 'left',
      tapId: args.tapId,
      x1: args.a.x,
      y1: args.a.y - args.a.upperArmRadius,
      x2: args.a.x + args.a.forearmRadius,
      y2: args.a.y - args.a.upperArmRadius,
      radius: args.a.forearmRadius
    })

    this.b.upperArm = new upperarm.UpperArm({
      parent: this.b,
      side: 'right',
      tapId: args.tapId,
      radius: args.b.upperArmRadius,
      forearmRadius: args.b.forearmRadius,
      center: {
        x: args.b.x,
        y: args.b.y
    }})
    this.b.forearm = new forearm.Forearm({
      parent: this.b,
      side: 'right',
      tapId: args.tapId,
      x1: args.b.x,
      y1: args.b.y - args.b.upperArmRadius,
      x2: args.b.x + args.b.forearmRadius,
      y2: args.b.y - args.b.upperArmRadius,
      radius: args.b.forearmRadius
    })

    this.pointer = new pointer.Pointer({
      parent: this,
      x: this.home.x,
      y: this.home.y,
      size: 6
    })

    // FIXME: Find out why this has to be called twice to get the
    // correct starting inverse kinematics angles
    this.a.forearm.move(this.home.x, this.home.y)
    this.a.forearm.move(this.home.x, this.home.y)
    this.b.forearm.move(this.home.x, this.home.y)
    this.b.forearm.move(this.home.x, this.home.y)
  }

  // Calculate current tap's outline as a polygon of points
  Tap.prototype.getOutline = function() {
    var points
    points = [
      // left shoulder
      {x: Number(this.a.upperArm.attr('x1')), y: Number(this.a.upperArm.attr('y1'))},
      // left elbow
      {x: Number(this.a.upperArm.attr('x2')), y: Number(this.a.upperArm.attr('y2'))},
      // pointer
      {x: Number(this.pointer.attr('cx')), y: Number(this.pointer.attr('cy'))},
      // right elbow
      {x: Number(this.b.upperArm.attr('x2')), y: Number(this.b.upperArm.attr('y2'))},
      // right shoulder
      {x: Number(this.b.upperArm.attr('x1')), y: Number(this.b.upperArm.attr('y1'))}
    ]
    return points
  }

  Tap.prototype.getIntersectPoints = function(posx, posy) {
    // Get the other tap id. Assume's two (and only two scene taps
    var otherTapId = Number(this.tapId) ? 0 : 1
    var otherOutline = this.parent.tap[otherTapId].getOutline()
    // var thisPointer = { center: { x: Number(this.pointer.attr('cx')),
    //                               y: Number(this.pointer.attr('cy'))},
    //                     radius: (Number(this.pointer.attr('r'))+10)}
    var position = { center: { x: posx, y: posy}, radius: 12}
    var intersectionPts = cintersect.circlePolygonIntersection(otherOutline, position)
    return intersectionPts
  }

  Tap.prototype.getArmLocation = function() {
    var loc = {}
    loc.tapId = this.tapId
    loc.x = parseInt(this.pointer.attr('cx'))
    loc.y = parseInt(this.pointer.attr('cy'))
    return loc
  }

  Tap.prototype.showBoundary = function() {
    this.a.upperArm.boundary.attr({visibility:"visible"})
    this.b.upperArm.boundary.attr({visibility:"visible"})
  }

  Tap.prototype.hideBoundary = function() {
    this.a.upperArm.boundary.attr({visibility:"hidden"})
    this.b.upperArm.boundary.attr({visibility:"hidden"})
  }

  exports.Tap = Tap

}(typeof exports === 'undefined' ? this.tap = {} : exports))