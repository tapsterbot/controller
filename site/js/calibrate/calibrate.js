var socket = io()


socket.on('client info?', function (data) {
  console.log(data)
  socket.emit('client info!', {
    "type": "calibrate",
    "height": window.innerHeight,
    "width": window.innerWidth,
    "orientation": window.orientation
  })
})


document.addEventListener("touchstart", start)
//document.addEventListener("mousedown",  start)

function start(e){
  console.log(e)
  var touch = event.touches[0]
  var pt = {x: touch.screenX, y: touch.screenY}
  socket.emit('screen touch!', pt)
}