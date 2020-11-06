let serial;          // variable to hold an instance of the serialport library
let portName = '/dev/tty.usbmodem142201';

let brushSize;
let anchors;
let anchorsSwitch = [false, false, false];

let canvas;
let video;
let poseNet;
let poses = [];

// save the strokes position and color here
let strokes = [];

// sounds
let loopSound;
let harp = [];
let xylophone = [];

// some html
let element;

function preload() {
  loopSound = loadSound('looperman.wav');

  for (let i = 1; i <= 10; i++) {
    let path = '/harp/' + i + '.wav';
    let harpsound = loadSound(path);
    harp.push(harpsound)
  }

  for (let i = 1; i <= 9; i++) {
    let path = '/xylophone/' + i + '.wav';
    let xylosound = loadSound(path);
    xylophone.push(xylosound)
  }
}

function setup() {
  serial = new p5.SerialPort();       // make a new instance of the serialport library
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen);        // callback for the port opening
  serial.on('data', serialEvent);     // callback for when new data arrives
  serial.on('error', serialError);    // callback for errors
  serial.on('close', portClose);      // callback for the port closing

  serial.list();                      // list the serial ports
  serial.open(portName);              // open a serial port

  canvas = createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();

  element = document.getElementsByTagName("canvas");
}

function modelReady() {
  select('#status').html('');
}

function mousePressed(){
  console.log(JSON.stringify(poses))
}

function draw() {
  translate(width,0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  checkAnchors();
  noStroke();

  // console.log("brush size: " + brushSize);
  // console.log("anchors: " + anchors);
  if (poses.length > 0) {
    let pose = poses[0].pose;

    // strokes for nose
    if(anchorsSwitch[0] == true) {
      // UI
      canvas.removeClass('leftWrist');
      canvas.removeClass('rightWrist');
      canvas.addClass('nose');

      let nose = pose['nose'];
      strokes.push([nose, brushSize, [nose.x/3, 0, nose.y/2]]);

      // play the sound
      let randomizedIndex = Math.floor(Math.random() * Math.floor(9));
      harp[randomizedIndex].setVolume(0.2);
      harp[randomizedIndex].play();
    }

    // strokes for left wrist
    if(anchorsSwitch[1] == true) {
      // UI
      canvas.addClass('leftWrist');
      canvas.removeClass('rightWrist');
      canvas.removeClass('nose');

      let leftWrist = pose['leftWrist'];
      strokes.push([leftWrist, brushSize, [leftWrist.x/3, leftWrist.y/2, 0]]);

      // play the sound
      let randomizedIndex = Math.floor(Math.random() * Math.floor(8));
      xylophone[randomizedIndex].setVolume(0.1);
      xylophone[randomizedIndex].play();
    }

    // strokes for right wrist
    if(anchorsSwitch[2] == true) {
      // UI
      canvas.removeClass('leftWrist');
      canvas.addClass('rightWrist');
      canvas.removeClass('nose');

      let rightWrist = pose['rightWrist'];
      strokes.push([rightWrist, brushSize, [rightWrist.x/3, rightWrist.y/2, 0]]);

      // play the sound
      let randomizedIndex = Math.floor(Math.random() * Math.floor(8));
      xylophone[randomizedIndex].setVolume(0.1);
      xylophone[randomizedIndex].play();
    }

    for(let i = 0; i < strokes.length; i++) {
      fill(strokes[i][2][0], strokes[i][2][1], strokes[i][2][2]);
      ellipse(strokes[i][0].x, strokes[i][0].y, strokes[i][1], strokes[i][1]);
    }
  }
}

function serverConnected() {
  console.log('connected to server.');
}

function portOpen() {
  console.log('the serial port opened.')
}

function serialEvent() {
  // inData = String.fromCharCode(Number(serial.read()));
  var inString = serial.readStringUntil('\r\n');

  //check to see that there's actually a string there:
  if (inString.length > 0 ) {
    anchors = inString.slice(0, 3).split('');
    brushSize = inString.slice(3, inString.length);
  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}

function checkAnchors() {
  if(anchors != undefined) {
    if (anchors[0] == 'a' && anchorsSwitch[0] == false) anchorsSwitch = [true, false, false];
    if (anchors[1] == 'a' && anchorsSwitch[1] == false) anchorsSwitch = [false, true, false];
    if (anchors[2] == 'a' && anchorsSwitch[2] == false) anchorsSwitch = [false, false, true];
  }
}

function mouseClicked() {
  loopSound.setVolume(0.2);
  loopSound.loop();
}
