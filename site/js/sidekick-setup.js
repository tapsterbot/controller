var socket = io()
var paper = Snap("#svg")

var ui = {}
//ui.axes = new axes.Axes()

//mobileDevice = new device.Device('nexus5')
ui.device = new device.Device('nexus5x')
//mobileDevice = new device.Device('iPhone 6')
//mobileDevice = new device.Device('iPhone 6 Plus')

var robot = new sidekick.Sidekick()


$( window ).resize(function() {
  // Get position svg rect
  deviceWidth = parseInt($('#device')[0].getBoundingClientRect().width - 20) + 'px'
  deviceLeft = parseInt($('#device')[0].getBoundingClientRect().left + 10) + 'px'
  deviceTop = parseInt($('#device')[0].getBoundingClientRect().top + 50) + 'px'

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

// socket.emit('angle', { tapId: 0, side: 'left', angle: 102.5})
// socket.emit('angle', { tapId: 0, side: 'right', angle: 78})
// socket.emit('angle', { tapId: 1, side: 'left', angle: 102.5})
// socket.emit('angle', { tapId: 1, side: 'right', angle: 78})

socket.on('client info?', function (data) {
  console.log(data)
  socket.emit('client info!', {
    "type": "simulator",
    "height": window.innerHeight, 
    "width": window.innerWidth,
    "orientation": window.orientation
  });
});

socket.on('arm location?', function (data) {
  console.log(data)
  socket.emit('arm location!', robot.tap0.getArmLocation())
  socket.emit('arm location!', robot.tap1.getArmLocation())
});

socket.on('arm set location!', function (data) {
  console.log(data)
  if (data.tapId == 0) {
    robot.tap0.pointer.move(data.x, data.y)
    robot.tap0.pointer.move(data.x, data.y)
  } else if (data.tapId == 1) {
    robot.tap1.pointer.move(data.x, data.y)
    robot.tap1.pointer.move(data.x, data.y)    
  }
});