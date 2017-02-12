if (typeof require !== 'undefined') {
   var Geometry = require( path.resolve('geometry') ).Geometry
   var paper = new Geometry()
}

(function(exports){
  Device = function(deviceName) {
    var devices = {
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
    var device = devices[deviceName]

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


    newDevice.attr({id:"device", fill: "rgba(0,0,0,0.2)", class:"device"})
    return newDevice
  }

  exports.Device = Device

}(typeof exports === 'undefined' ? this.device = {} : exports))