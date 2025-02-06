const colors = [
  [50, 205, 50],     // Lime Green
  [46, 139, 87],     // Sea Green
  [0, 255, 127],     // Spring Green
  [152, 255, 152],   // Mint Green
  [107, 142, 35]     // Olive Drab
];

let resolution = 5;  // Initialize resolution for display
let capturer;
let isRecording = false;
let duration = 10; // Length of the video in seconds
let frameCountLimit;
let frameRateValue = 24; // Set the desired frame rate
let hueOffset = 0;
let animationRunning = false;
let firstFrameRendered = false;

// Create a graphics buffer for high-resolution rendering
let highResBuffer;
const highResWidth = 1920;
const highResHeight = 1080;

function setup() {
  createCanvas(640, 480);
  highResBuffer = createGraphics(highResWidth, highResHeight); // High-resolution buffer
  frameRate(frameRateValue); // Control the speed of animation
  noiseDetail(8, 0.65);  // Adjust the noise parameters
  capturer = new CCapture({ format: 'webm', framerate: frameRateValue }); // Change format to 'webm'
  frameCountLimit = duration * frameRateValue; // Calculate total frames

  console.log("CCapture initialized:", typeof CCapture); // Check if CCapture is defined
  console.log("Frame Count Limit:", frameCountLimit);

  // Add event listeners for buttons
  document.getElementById('startAnimationBtn').addEventListener('click', startAnimation);
  document.getElementById('recordBtn').addEventListener('click', toggleRecording);
  document.getElementById('saveBtn').addEventListener('click', saveArtwork);
  document.getElementById('randomizeColorsBtn').addEventListener('click', randomizeColors);
  document.getElementById('animateColorsBtn').addEventListener('click', animateColors);
  document.getElementById('setCustomColorsBtn').addEventListener('click', setCustomColors);

  // Render the first frame
  generatePixelArt();
  firstFrameRendered = true;

  // Update initial progress display
  document.getElementById('progressDisplay').innerText = `Frames: 0 / ${frameCountLimit} (0%)`;
}

function draw() {
  if (!animationRunning) {
    if (!firstFrameRendered) {
      generatePixelArt();
      firstFrameRendered = true;
    }
    noLoop();
  } else {
    if (isRecording && frameCount <= frameCountLimit) {
      generatePixelArt(true); // Render to high-resolution buffer when recording
      capturer.capture(highResBuffer.canvas);
      console.log("Recording frame:", frameCount);
      updateProgressDisplay();
    } else if (isRecording && frameCount > frameCountLimit) {
      capturer.stop();
      capturer.save();
      noLoop();
      isRecording = false;
      console.log("Recording stopped and saved.");
    }

    generatePixelArt();
  }
}

function startAnimation() {
  animationRunning = !animationRunning;
  document.getElementById('startAnimationBtn').classList.toggle('active', animationRunning);
  if (animationRunning) {
    loop(); // Ensure animation loop is running
    console.log("Animation started.");
  } else {
    noLoop();
    console.log("Animation stopped.");
  }
}

function generatePixelArt(highRes = false) {
  const target = highRes ? highResBuffer : this;

  target.clear();

  for (let y = 0; y < target.height; y += resolution) { // Corrected for loop syntax
    for (let x = 0; x < target.width; x += resolution) { // Corrected variable to `x` from `y`
      const n = noise(x * 0.1, y * 0.1) * colors.length;
      const c = colors[int(n) % colors.length];  // Ensure index is within bounds
      target.fill(c[0], c[1], c[2], random(255)); // Adding alpha for transparency
      target.rect(x, y, resolution, resolution);
    }
  }
  
  if (!highRes) {
    image(highResBuffer, 0, 0, width, height); // Scale down high-res buffer for display
  }
}

function toggleRecording() {
  if (!isRecording) {
    isRecording = true;
    capturer.start();
    frameCount = 0; // Reset frame count
    loop(); // Ensure animation loop is running
    document.getElementById('recordBtn').innerText = 'Stop Recording';
    document.getElementById('recordBtn').classList.add('active');
    console.log("Recording started.");
  } else {
    isRecording = false;
    capturer.stop();
    capturer.save();
    noLoop();
    document.getElementById('recordBtn').innerText = 'Start Recording';
    document.getElementById('recordBtn').classList.remove('active');
    console.log("Recording stopped and saved.");
  }
}

function saveArtwork() {
  saveCanvas('pixelArt', 'png');  // Save the canvas as a PNG file
  console.log("Artwork saved.");
}

function randomizeColors() {
  for (let i = 0; i < colors.length; i++) {
    colors[i] = [random(255), random(255), random(255)];
  }
  console.log("Randomized colors:", colors);
}

function animateColors() {
  hueOffset += 0.01; // Increase the increment for faster animation if desired
  for (let i = 0; i < colors.length; i++) {
    let r = (colors[i][0] + hueOffset) % 255;
    let g = (colors[i][1] + hueOffset) % 255;
    let b = (colors[i][2] + hueOffset) % 255;
    colors[i] = [lerp(colors[i][0], r, 0.05), lerp(colors[i][1], g, 0.05), lerp(colors[i][2], b, 0.05)]; // Gradual transition
  }
  console.log("Animating colors with hue offset:", hueOffset);
}

function hexToRgb(hex) {
  let bigint = parseInt(hex.slice(1), 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  return [r, g, b];
}

function setCustomColors() {
  colors[0] = hexToRgb(document.getElementById('color1').value);
  colors[1] = hexToRgb(document.getElementById('color2').value);
  colors[2] = hexToRgb(document.getElementById('color3').value);
  colors[3] = hexToRgb(document.getElementById('color4').value);
  colors[4] = hexToRgb(document.getElementById('color5').value);
  console.log("Custom colors set:", colors);
}

function updateProgressDisplay() {
  const progressDisplay = document.getElementById('progressDisplay');
  const percentage = ((frameCount / frameCountLimit) * 100).toFixed(2);
  progressDisplay.innerText = `Frames: ${frameCount} / ${frameCountLimit} (${percentage}%)`;
}
