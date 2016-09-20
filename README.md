# Controller for Tapster Sidekick 
Web-based controller for the Tapster Sidekick robot

![Controller demo](doc/demo.gif)

## Buidling

  1.  install the required Node modules:

  ```
  npm install
  ```

  2.  Download all git submodules. We include minicap as a Git submodule. And minicap includes libjpeg-turbo.

  ```
  git submodule update --init --recursive
  ```

  3.  Build minicap. This requires compiling with the Android NDK:

  ```
  cd minicap
  ndk-build
  cd ..
  ```

  (You should now see the required Android binaries available in `./libs`.)

  4.  Install minicap's Node modules:

  ```
  cd minicap/example
  npm install
  cd ../..
  ```
  


## Running

  1. Run server.js from the main checkout directory:

  ```
  node server.js
  ```

  2. Open the controller URL:
  ```
  http://localhost:8080/
  ```