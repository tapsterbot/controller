var socket = io()
paper = Snap("#svg")


Device = function(deviceName) {
  devices = {
    'nexus5' : {
      width: 137.9,
      height: 69.2
    },
    'nexus5x': {
      width: 72.6,   
      height: 147.0
    },
    'iphone' : {
      width: 200,
      height: 100
    },
    'iPhone 6' : {
      width: 138.1,
      height: 67.0
    },    
    'iPhone 6 Plus' : {
      width: 158.1,
      height: 77.8
    },        
    'tablet' : {
      height: 266,
      width: 178
    }
  }
  device = devices[deviceName]

  var newDevice = paper.rect(-device.width/2,
                             -device.height/2,
                              device.width,
                              device.height)
  
  // FIXME - make this moduluar, less hacky
  // if (deviceName === 'nexus5x') {
  //   // Nexus 5x power button:
  //   var phone_w = devices.nexus5x.width
  //   var phone_h = devices.nexus5x.height
  //   var power_button = paper.rect(-phone_w/2 + 39, -phone_h/2 - 2, 10, 2)
  //   power_button.attr({fill: "rgba(0,0,0,1)"})
  //
  //   // Nexus 5x volume button:
  //   var volume_button = paper.rect(-phone_w/2 + 59, -phone_h/2 - 2, 22, 2)
  //   volume_button.attr({fill: "rgba(0,0,0,1)"})
  // }
      
    
    
  videoElem = $('#video')[0]  
  newDevice.attr({id:"device", fill: "rgba(0,0,0,0.2)", class:"device"})
  return newDevice
}

var armConfigs = {
  '1': [2,3,0,1],
  '2': [0,1,2,3],
  '3': [0,1,0,1],
  '4': [2,3,2,3]
}

Tap = function(args) {
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

  this.a.shoulder = new Shoulder(args.a.x-20, args.a.y-20, 40, 40, 5, 5)
  this.b.shoulder = new Shoulder(args.b.x-20, args.b.y-20, 40, 40, 5, 5)

  this.a.upperArm = new UpperArm({
    parent: this.a,
    side: 'left',
    tapId: args.tapId,    
    radius: args.a.upperArmRadius,
    forearmRadius: args.a.forearmRadius,
    center: {
      x: args.a.x,
      y: args.a.y
  }})
  this.a.forearm = new Forearm({
    parent: this.a,
    side: 'left',
    tapId: args.tapId,
    x1: args.a.x,
    y1: args.a.y - args.a.upperArmRadius,
    x2: args.a.x + args.a.forearmRadius,
    y2: args.a.y - args.a.upperArmRadius,
    radius: args.a.forearmRadius
  })

  this.b.upperArm = new UpperArm({
    parent: this.b,
    side: 'right',
    tapId: args.tapId,    
    radius: args.b.upperArmRadius,
    forearmRadius: args.b.forearmRadius,
    center: {
      x: args.b.x,
      y: args.b.y
  }})
  this.b.forearm = new Forearm({
    parent: this.b,
    side: 'right',
    tapId: args.tapId,
    x1: args.b.x,
    y1: args.b.y - args.b.upperArmRadius,
    x2: args.b.x + args.b.forearmRadius,
    y2: args.b.y - args.b.upperArmRadius,
    radius: args.b.forearmRadius
  })

  this.pointer = new Pointer({
    parent: this,
    x: this.home.x,
    y: this.home.y,
    size: 6
  })

  this.a.forearm.move(this.home.x, this.home.y)
  this.b.forearm.move(this.home.x, this.home.y)

}

Tap.prototype.showBoundary = function() {
  this.a.upperArm.boundary.attr({visibility:"visible"})
  this.b.upperArm.boundary.attr({visibility:"visible"})
}

Tap.prototype.hideBoundary = function() {
  this.a.upperArm.boundary.attr({visibility:"hidden"})
  this.b.upperArm.boundary.attr({visibility:"hidden"})
}


UpperArm = function(args){
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
    side: args.side
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

    var result = limit(posx, posy, cx, cy, cr)
    this.attr({"x2": result.x, "y2": result.y})

    var forearm = this.parent.forearm

    var side = this.attr('side')
    if (side == "left") {
      points = intersection(parseInt(this.attr('x2')),
                            parseInt(this.attr('y2')),
                            forearm.radius,
                            parseInt(this.parent.parent.b.upperArm.attr('x2')),
                            parseInt(this.parent.parent.b.upperArm.attr('y2')),
                            forearm.radius)
    } else {
      points = intersection(parseInt(this.attr('x2')),
                            parseInt(this.attr('y2')),
                            forearm.radius,
                            parseInt(this.parent.parent.a.upperArm.attr('x2')),
                            parseInt(this.parent.parent.a.upperArm.attr('y2')),
                            forearm.radius)
    }

    if (points[0] == 1) {

      // TODO: Find out why intersection() returns NaN points when upperArms touch
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


Forearm = function(args) {
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
      points = intersection(
        this.parent.parent.a.center.x,
        this.parent.parent.a.center.y,
        upperArm.radius,
        posx,
        posy,
        this.radius)
    } else {
      points = intersection(
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
      
      var armAngle = angle(upperArm.attr('x1').toFloat(),
                           upperArm.attr('y1').toFloat(),
                           upperArm.attr('x2').toFloat(),
                           upperArm.attr('y2').toFloat())

      if (tapId == "1") {
        if (side == "left") {
          armAngle = (armAngle*-1) + 30;
          armAngle = Math.round(armAngle * 10) / 10;            

          upperArm.attr({"x2": points[1][armConfigs[this.parent.parent.armConfig][0]],
                        "y2": points[1][armConfigs[this.parent.parent.armConfig][1]]})
        } else {
          //console.log('right angle:' + armAngle)
          armAngle = 180 - (armAngle + 30)
          armAngle = Math.round(armAngle * 10) / 10;
          //console.log('new right angle:' + armAngle)
          if (armAngle <= 0) {
            armAngle = 360 + armAngle
            //console.log('newer right angle:' + armAngle)
          }
          
          upperArm.attr({"x2": points[1][armConfigs[this.parent.parent.armConfig][2]],
                         "y2": points[1][armConfigs[this.parent.parent.armConfig][3]]})
        }
      } else if (tapId == "2") {
        if (side == "left") {
          //console.log('2: left angle:' + armAngle)  
          if (armAngle <= 0) { 
            armAngle = (armAngle*-1) - 180 + 30  
            if (armAngle < 0) { armAngle = 0 }
          } else {
            armAngle = (armAngle*-1) + 30 + 180
            if (armAngle > 180) { armAngle = 180 }
          }
          armAngle = Math.round(armAngle * 10) / 10;
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
          armAngle = Math.round(armAngle * 10) / 10;
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

    } else {
      // points are outside the limits
      var cx = parseInt(this.attr('x1'))
      var cy = parseInt(this.attr('y1'))
      var cr = parseInt(this.attr('cr'))
      var result = limit(posx, posy, cx, cy, cr)
      this.attr({"x2": result.x, "y2": result.y})
      if (side == "left") {
        var result = limit(
          posx,
          posy,
          this.parent.parent.a.center.x,
          this.parent.parent.a.center.y,
          this.parent.parent.a.upperArm.radius
        )
      } else {
        var result = limit(
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

Shoulder = function(x, y, width, height, rx, ry) {
  var shoulder = paper.rect(x, y, width, height, rx, ry)
  shoulder.attr({ class: "shoulder" })
  return shoulder
}

Pointer = function(args) {
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
        var result = limit(
          posx,
          posy,
          this.parent.b.center.x,
          this.parent.b.center.y,
          this.parent.b.upperArm.radius + this.parent.b.forearm.radius - 4
        )
      } else {
        var result = limit(
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

Grid = function(args) {
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

////////////////////////////
// UI Setup
//grid = new Grid()

//device = new Device('nexus5')
device = new Device('nexus5x')
//device = new Device('iPhone 6')
//device = new Device('iPhone 6 Plus')

tap1 = new Tap({
  tapId: '1',
  a: {x:-108, y:-(8*4), upperArmRadius:8*9, forearmRadius:8*13},
  b: {x:-108, y:(8*4), upperArmRadius:8*9, forearmRadius:8*13},
  home: {x: -60, y:0},
  armConfig: '1'
})


tap2 = new Tap({
  tapId: '2',
  a: {x:108, y:(8*4), upperArmRadius:8*9, forearmRadius:8*13},
  b: {x:108, y:-(8*4), upperArmRadius:8*9, forearmRadius:8*13},
  home: {x: 60, y:0},
  armConfig: '1'
})


$( window ).resize(function() {
  // Get position svg rect
  deviceWidth = parseInt($('#device')[0].getBoundingClientRect().width - 20) + 'px'
  deviceLeft = parseInt($('#device')[0].getBoundingClientRect().left + 10) + 'px'
  deviceTop = parseInt($('#device')[0].getBoundingClientRect().top + 80) + 'px'

  // Set video position
  $('#video').css({
    'width':deviceWidth,
    'left':deviceLeft,
    'top':deviceTop
  }) 

  $('#canvas').css({
    'width':deviceWidth,
    'left':deviceLeft,
    'top':deviceTop
  })   
  
});

socket.emit('angle', { tapId: 1, side: 'left', angle: 102.5})
socket.emit('angle', { tapId: 1, side: 'right', angle: 78})
socket.emit('angle', { tapId: 2, side: 'left', angle: 102.5})
socket.emit('angle', { tapId: 2, side: 'right', angle: 78})



