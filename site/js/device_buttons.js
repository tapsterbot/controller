



// Nexus 5x power button:
phone_w = devices.nexus5x.width
phone_h = devices.nexus5x.height
power_button = paper.rect(-phone_w/2 + 39, -phone_h/2 - 2, 10, 2)
power_button.attr({fill: "rgba(0,0,0,1)"})

// Nexus 5x volume button:
volume_button = paper.rect(-phone_w/2 + 59, -phone_h/2 - 2, 22, 2)
volume_button.attr({fill: "rgba(0,0,0,1)"})