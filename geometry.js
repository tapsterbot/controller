var Geometry = function (args) {
  if ( !(this instanceof Geometry) ) {
    return new Geometry(args)
  }
}

Geometry.prototype.rect = function(x, y, width, height, rx, ry) {
  return new Element({
    x: x,
    y: y,
    width: width,
    height: height,
    rx: rx,
    ry: ry
  })
}

Geometry.prototype.line = function(x1, y1, x2, y2) {
  return new Element({
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2
  })
}

Geometry.prototype.circle = function(x, y, r) {
  return new Element({
    cx: x,
    cy: y,
    r: r
  })
}


var Element = function(args) {
  if ( !(this instanceof Element) ) {
    return new Element(args)
  }

  if (args) {
    var keys = Object.keys(args)
    keys.forEach(function(key){
      this[key] = args[key]
    }, this)
  }
}

Element.prototype.attr = function(args) {
  if (typeof args === 'object') {
    var keys = Object.keys(args)
    keys.forEach(function(key){
      this[key] = args[key]
    }, this)
    return this
  } else if (typeof args === 'string'){
    return this[args]
  }
}

Element.prototype.drag = function(onmove, onstart, onend, mcontext, scontext, econtext) {
  this.onmove = onmove
  return this
}

Element.prototype.click = function(func) {
  this.onclick = func
  return this
}

exports.Element = Element
exports.Geometry = Geometry