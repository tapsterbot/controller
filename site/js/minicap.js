var BLANK_IMG =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

var canvas = document.getElementById('canvas')
var g = canvas.getContext('2d')

//var ws = new WebSocket('ws://' + window.location.host, 'minicap')
//var ws = new WebSocket('ws://' + window.location.host)
var ws = new WebSocket('ws://' + window.location.hostname + ":9002")
ws.binaryType = 'blob'

var onmovego = false;

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(evt.clientX - rect.left),
    y: Math.floor(evt.clientY - rect.top)
  };
}

canvas.addEventListener('mousemove', function(evt) {
  if (onmovego) {
    var mousePos = getMousePos(canvas, evt);
    var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
    console.info(message)
    var curTouchInfo = {
      type: 'move',
      x: mousePos.x,
      y: mousePos.y
    }
    ws.send(JSON.stringify(curTouchInfo))
  }
}, false);

canvas.addEventListener('mousedown', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  var message = 'DOWN -- Mouse position: ' + mousePos.x + ',' + mousePos.y;
  console.info(message);
  var curTouchInfo = {
    type: 'down',
    x: mousePos.x,
    y: mousePos.y
  };
  onmovego = true;
  ws.send(JSON.stringify(curTouchInfo));
}, false);

canvas.addEventListener('mouseup', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  var message = 'UP -- Mouse position: ' + mousePos.x + ',' + mousePos.y;
  console.info(message);
  var curTouchInfo = {
    type: 'up',
    x: mousePos.x,
    y: mousePos.y
  };
  onmovego = false;
  ws.send(JSON.stringify(curTouchInfo));
}, false);

ws.onclose = function() {
  //alert("onclose received, args = " + JSON.stringify(arguments))
  //console.log('onclose', arguments)
}

ws.onerror = function() {
  //alert("onerror received, args = " + JSON.stringify(arguments))
  //console.log('onerror', arguments)
}

ws.onmessage = function(message) {
  var blob = new Blob([message.data], {type: 'image/jpeg'})
  var URL = window.URL || window.webkitURL
  var img = new Image()
  
  img.onload = function() {
    //console.log(img.width, img.height)
    // canvas.width = img.width
    // canvas.height = img.height
    g.save();
    width = img.width;
    height = img.height;
    // canvas.width = img.height
    // canvas.height = img.width
    canvas.width = img.width
    canvas.height = img.height

    
    // x = parseInt($('#device')[0].getBoundingClientRect().left)
    // y = parseInt($('#device')[0].getBoundingClientRect().top)
    // g.translate(x, y)
    
    x = canvas.width / 2
    y = canvas.height / 2 
    g.translate(x, y)
    g.rotate(0*Math.PI/180)
    g.drawImage(img, -width / 2, -height / 2, width, height)
    g.restore();
    //g.drawImage(img, 0, 0)
    img.onload = null
    img.src = BLANK_IMG
    img = null
    u = null
    blob = null
  }
  var u = URL.createObjectURL(blob)
  img.src = u
}

ws.onopen = function() {
  //alert("onopen received, args = " + JSON.stringify(arguments))
  console.log('onopen', arguments)
  // Get position svg rect
  deviceWidth = parseInt($('#device')[0].getBoundingClientRect().width - 20) + 'px'
  deviceLeft = parseInt($('#device')[0].getBoundingClientRect().left + 10) + 'px'
  deviceTop = parseInt($('#device')[0].getBoundingClientRect().top + 50) + 'px'
  $('#canvas').css({
    'visibility': 'visible',
    'width':deviceWidth,
    'left':deviceLeft,
    'top':deviceTop
  })
  //ws.send('1920x1080/0')
  //ws.send('720x1280/0')
  //ws.send('1280x720/0')
}
