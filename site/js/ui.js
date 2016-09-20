if (typeof process === 'object') {
  // We're running in node-scope
  var gui = require('nw.gui');
  var mb = new gui.Menu({type:"menubar"});
  mb.createMacBuiltin("your-app-name");
  gui.Window.get().menu = mb;
} else {
   // We're running in browser-scope
}