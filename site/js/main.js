var videoElement = document.querySelector("video");
var videoSelect = document.querySelector("select#videoSource");
var startButton = document.querySelector("button#start");
var sourceInfo;

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function gotSources(sourceInfos) {
  for (var i = 0; i != sourceInfos.length; ++i) {
    sourceInfo = sourceInfos[i];
    var option = document.createElement("option");
    option.value = sourceInfo.id;

    if (sourceInfo.kind === 'video') {
      option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source: ', sourceInfo);
    }
  }
}

if (typeof MediaStreamTrack === 'undefined'){
  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
} else {
  setTimeout(function(){ MediaStreamTrack.getSources(gotSources); }, 1000); 
}


function successCallback(stream) {
  window.stream = stream; // make stream available to console
  videoElement.src = window.URL.createObjectURL(stream);
  videoElement.play();
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

function start(){
  if (!!window.stream) {
    videoElement.src = '';
    window.stream.stop();
  }

  var videoSource = videoSelect.value; 
  var constraints = {
    video: {
      mandatory: {
        minWidth: 1280,
        minHeight: 720
      },
      optional: [{sourceId: videoSource}]
    }
  };
  try {
    navigator.getUserMedia(constraints, successCallback, errorCallback);
  } catch (e) {
    console.log('error');
  }
}

videoSelect.onchange = start;

// start();
