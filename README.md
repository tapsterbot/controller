# Controller for Tapster Sidekick 
Web-based controller for the Tapster Sidekick robot

[![Controller Demo Video](https://img.youtube.com/vi/MAu_O9O79Sc/0.jpg)](https://www.youtube.com/watch?v=MAu_O9O79Sc)

## Prerequisites

* [Node.js](https://nodejs.org/)
* [Android NDK](https://developer.android.com/ndk/index.html)
* [Android SDK](https://developer.android.com/studio/index.html#downloads)


## Building

1.  install the required Node modules:
  ```
  npm install
  ```

2.  Download all git submodules. We include [minicap](https://github.com/tapsterbot/minicap) as a Git submodule. And minicap includes [libjpeg-turbo](http://libjpeg-turbo.virtualgl.org/).
  ```
  git submodule update --init --recursive
  ```

3.  Build minicap. This requires compiling with the [Android NDK](https://developer.android.com/ndk/index.html):
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

(*Make sure you have connected an Android device via USB and that USB debugging is enabled on the device.*)

1. Run server.js from the main checkout directory:
  ```
  node server.js
  ```

2. Open the controller URL:
  ```
  http://localhost:8080/
  ```
  
![Controller Demo Screenshot](doc/screenshot.png)  


## F.A.Q. / Issues

Q: How do I tap the screen? Where's the tap/click command?!

A: There's currently no gesture in the controller web interface for controlling the z-height of Sidekick's arms. For the moment, here's how you can move each arm up and down.

When you launch server.js, it also launches a REPL prompt. The left arm's z-axis servo is mapped to the object "s3" (for servo #3), and the right arm's z-axis servo is mapped to "s6" (for servo #6).

**To raise arm to a safety height:**<br>
('100' is the height, '1000' is the number of milliseconds the servo will take to complete the move.)
```
>> // Left z-axis
>> s3.to(100,1000)

>> // Right z-axis
>> s6.to(100,1000)
```

**To move arm to screen surface:**<br>
(Note: you might have to change '70' a little, depending on how your Sidekick robot was assembled.)
```
>> // Left z-axis
>> s3.to(70,1000)

>> // Right z-axis
>> s6.to(70,1000)
```

**To lower arm to side of phone to hit device power and volume buttons:**<br>
(Note: You should move the stylus away from the phone screen's surface beforehand.)
```
>> // Left z-axis
>> s3.to(20,1000) 

>> // Right z-axis
>> s6.to(20,1000) 
```
