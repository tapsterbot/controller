// Circle Line Collision
// Source: http://devmag.org.za/2009/04/17/basic-collision-detection-in-2d-part-2/
// Input:
//   p1  Point  First point describing the line
//   p2  Point  Second point describing the line
//   center  Point  The centre of the circle
//   radius  Floating-point  The circle's radius
//
// Output:
//   The point(s) of the collision, or null if no collision exists.
//

(function(exports){

  function circleLineIntersection(p1, p2, circle) {
  	// Transform to local coordinates
  	var localP1 = {x: (p1.x - circle.center.x), y: (p1.y - circle.center.y)}
  	var localP2 = {x: (p2.x - circle.center.x), y: (p2.y - circle.center.y)}

  	// Precalculate this value. We use it often
    var p2p1 = {x: (localP2.x - localP1.x),
                y: (localP2.y - localP1.y)}

  	var a = (p2p1.x * p2p1.x) + (p2p1.y * p2p1.y)
  	var b = 2 * ((p2p1.x * localP1.x) + (p2p1.y * localP1.y))
  	var c = (localP1.x * localP1.x) + (localP1.y * localP1.y) - (circle.radius * circle.radius)
  	var delta = b * b - (4 * a * c)

  	if (delta < 0) {
      return []
    } else if (delta === 0) { // One intersection
      var u = -b / (2 * a)
      // Use p1 instead of localP1 because we want our answer
      // in global space, not the circle's local space
      var result = {x: (p1.x + (u * p2p1.x)),
                    y: (p1.y + (u * p2p1.y))}
      return [result]
  	} else if (delta > 0) { // Two intersections
      var sqrtDelta = Math.sqrt(delta)
      var u1 = (-b + sqrtDelta) / (2 * a)
      var u2 = (-b - sqrtDelta) / (2 * a)
      result = [ {x: (p1.x + (u1 * p2p1.x)),
                      y: (p1.y + (u1 * p2p1.y))},
                     {x: (p1.x + (u2 * p2p1.x)),
                      y: (p1.y + (u2 * p2p1.y))}]
      return result
    }
  }


  function distance(a, b) {
    return Math.sqrt( Math.pow( (a.x - b.x), 2) + Math.pow( (a.y - b.y), 2))
  }

  function isBetween(a, c, b) {
      return (distance(a, c) + distance(c, b) === distance(a, b))
  }

  function isBetweenFilter(point) {
      return (distance(this.a, point) + distance(point, this.b) === distance(this.a, this.b))
  }

  function circleLineSegmentIntersection(p1, p2, c) {
    var linePoints = circleLineIntersection(p1, p2, c)
    var segmentPoints = linePoints.filter(isBetweenFilter, {a:p1, b:p2})
    return segmentPoints
  }


  function circlePolygonIntersection(poly, circle) {
    var point1, point2, linepoints, segmentPoints
    var allPoints = []
    var uniquePoints = []

    for (var i=0; i < poly.length; i++) {
      point1 = poly[i]
      if (i == poly.length-1) {
        point2 = poly[0]
      } else {
        point2 = poly[i+1]
      }
      segmentPoints = circleLineSegmentIntersection(point1, point2, circle)
      allPoints = allPoints.concat(segmentPoints)
    }
    return allPoints
  }

  exports.circleLineIntersection = circleLineIntersection
  exports.circlePolygonIntersection = circlePolygonIntersection

}(typeof exports === 'undefined' ? this.cintersect = {} : exports))


// polygon = [{x:1, y:0}, {x:1, y:1}, {x:-1, y:0}, {x:-1, y:-1}]
// hitpoints.findIndex(i => (i.x == -1) && (i.y == 0))
// polygon.findIndex(i => (i.x == -1) && (i.y == 0))
// circlePolygonIntersection(polygon, {center:{x:2, y:0}, radius:1})

/* Test:
    > var point1 = {x: 0, y: -5}
    > var point2 = {x: 0, y: 5}
    > var circle = {'center': {x: 5, y: 0}, 'radius': 1}


    // Test line intersection
    > circleLineIntersection(point1, point2, circle)
    []

    > circle.radius = 5
    > circleLineIntersection(point1, point2, circle)
    [ { x: 0, y: 0 } ]

    > circle.center = {x: 0, y: 0}
    > circleLineIntersection(point1, point2, circle)
    [ { x: 0, y: 5 }, { x: 0, y: -5 } ]



    // Test line segment intersection
    > radius = 1
    > circle.center = { x: 0, y: 4.5 }
    > circleLineIntersection(point1, point2, circle)
    [ { x: 0, y: 5.5 }, { x: 0, y: 3.5 } ]

    > circleLineSegmentIntersection(point1, point2, circle)
    [ { x: 0, y: 3.5 } ]

    > circle.center = { x: 0, y: 10 }
    > circleLineIntersection(point1, point2, circle)
    [ { x: 0, y: 11 }, { x: 0, y: 9 } ]

    > circleLineSegmentIntersection(point1, point2, circle)
    > []

*/

// module.exports = circleLineIntersection