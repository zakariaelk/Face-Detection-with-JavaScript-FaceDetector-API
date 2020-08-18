// the video
const video = document.querySelector(".webcam");

// the video canvas
const canvas = document.querySelector(".video");
const ctx = canvas.getContext("2d");

// the face canvas
const faceCanvas = document.querySelector(".face");
const faceCtx = faceCanvas.getContext("2d");

// We create our facedetector instance using the "FaceDetector()" API
const faceDetector = new FaceDetector({ fastMode: true });

const optionsInputs = document.querySelectorAll(".controls input[type='range']");

// Size & Scale

const options = {
  SIZE: 10,
  SCALE: 1.35,
};

function updateOptions(e) {
  // link the input field name to the option name
  // Method 1 The long form
  //   let currentInput = e.currentTarget.name;
  //   let currentInputVal = e.currentTarget.value;
  //     options[currentInput] = currentInputVal;

  // Method 2 Destructuring
  let { value, name } = e.currentTarget;
  // update that input field with the appropriat value,
  options[name] = value;
}

optionsInputs.forEach((input) => input.addEventListener("input", updateOptions));

// write a function that will populate the webcam recording into the video player.

async function populateVideo() {
  // We grab the feed off the user's webcam
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
  });

  // We set the object to be the stream
  video.srcObject = stream; // usually when dealing with video files we use video.src = 'videoName.mp4'
  await video.play();

  // size the canvases to be the same size as the video
  console.log(video.videoWidth, video.videoHeight);

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  faceCanvas.width = video.videoWidth;
  faceCanvas.height = video.videoHeight;
}

// We create our face detection function with the FaceDetector API
async function detect() {
  // We set our faceDetector to detect the video
  const faces = await faceDetector.detect(video); // this method accepts (image/video/canvas)
  faces.forEach(drawFace);
  faces.forEach(censor);
  requestAnimationFrame(detect);
  //   console.log(faces);
}

function drawFace(face) {
  const { width, height, top, left } = face.boundingBox; // Destructuring the boundingBox obj
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  faceCtx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "transparent";
  ctx.lineWidth = 0;
  ctx.strokeRect(left, top, width, height);
}

function censor({ boundingBox: face }) {
  faceCtx.imageSmoothingEnabled = false;
  faceCtx.drawImage(
    //   draw the small face
    //   drawImage() args are:
    //   5 source args
    video,
    face.x,
    face.y,
    face.width,
    face.height,
    //   4 draw args
    // Where should we start drawing the x and y?
    face.x,
    face.y,
    options.SIZE,
    options.SIZE
  );

  const width = face.width * options.SCALE;
  const height = face.height * options.SCALE;

  faceCtx.drawImage(
    //   source args
    faceCanvas,
    face.x,
    face.y,
    options.SIZE, //Notice here we're only capturing the Width of value "options.SIZE" to draw
    options.SIZE, //Notice here we're only capturing the Height of value "SIZE" to draw

    //   draw args
    face.x - (width - face.width) / 2,
    face.y - (height - face.height) / 2,
    width,
    height
  );
  // take that face back out and draw it back at normal size?
  //
}

// The long Method
// function censor(face) {
//     const faceDetails = face.boundingBox;
//     console.log(faceDetails);
// }

populateVideo().then(detect);
