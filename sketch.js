let walls = [];
let ray;
let particle;

/////////////TEXT////////////////
let myFont
////UI TEXT ANIMATION
let wiggleAmount = 1;  // Control the intensity of the wiggle
let wiggleSpeed = 0.09;  // Control the speed of the wiggle
///////////

let rayColor; // Global variable for the ray color

let wallCount = 7; // Number of vertical walls
let rayCount = 1; // Ray density
let blackKeys = []; // Array to store black key rectangles
let blackKeyPositions
let keyWidth
let keyHeight 

// Sound variables
let doSoud, reSound, miSound, faSound, solSound,laSound, siSound;


/////SOUND RECORDER/////
let isRecording = false; // To track recording status
let recorder; // p5 Recorder object
let soundFile; // p5 SoundFile object for the recorded audio

/////KEY POSITION ////
let keyX
let keyY

let y1
let y2

let pianoHeight 
let pianoWidth
let xOffset
let step 

function preload() {
  doSound = loadSound("Do.mp3");
  reSound = loadSound("RE.mp3");
  miSound = loadSound("Mi.mp3");
  faSound = loadSound("Fa.mp3");
  solSound = loadSound("Sol.mp3");
  laSound = loadSound("La.mp3");
  siSound = loadSound("Si.mp3");

  myFont = loadFont('RubikBubbles-Regular.ttf');


}

function setup() {
  createCanvas(windowWidth, windowHeight); // Fullscreen canvas
  
    // Initialize ray color to match background (initial color: light blue)
  rayColor = color(54, 240, 255);
  
  pianoWidth = width * 0.8; // Use 90% of the canvas width for the piano
  xOffset = (width - pianoWidth) / 2; // Center the piano horizontally
  step = pianoWidth / (wallCount + 1); // Spacing between vertical walls

  // Adjust the piano height to leave 15% of the screen space at the bottom
  pianoHeight = height * 0.93; // Use 85% of the canvas height for the piano

  for (let i = 0; i < wallCount; i++) {
    let x = xOffset + step * (i + 1); // Calculate x-coordinate for this wall
    y1 = height - pianoHeight; // Start y-coordinate (aligned with the top of the piano area)
    y2 = height - height * 0.14; // End y-coordinate (85% of the canvas height)
    walls[i] = new Boundary(x, y1, x, y2); // Create a vertical wall
  }

  // Adding border walls for the piano area
  walls.push(new Boundary(xOffset, height - pianoHeight, xOffset + pianoWidth, height - pianoHeight)); // Top border of piano area
  walls.push(new Boundary(xOffset + pianoWidth, height - pianoHeight, xOffset + pianoWidth, height - height * 0.14)); // Right border
  walls.push(new Boundary(xOffset + pianoWidth, height - height * 0.14, xOffset, height - height * 0.14)); // Bottom border
  walls.push(new Boundary(xOffset, height - height * 0.14, xOffset, height - pianoHeight)); // Left border

  // Adding the horizontal boundary at the bottom of the piano simulator
  walls.push(new Boundary(xOffset, height - height * 0.14, xOffset + pianoWidth, height - height * 0.14));

  // Adding black keys (rectangles)
  blackKeyPositions = [1, 2, 4, 5, 6]; // Relative positions for black keys
  keyWidth = step * 0.6; // Width of black key rectangles
  keyHeight = pianoHeight / 2; // Height of black key rectangles (relative to the piano area)

  for (let octave = 0; octave < wallCount / 7; octave++) {
    for (let pos of blackKeyPositions) {
      let x = xOffset + step * (pos + 5 * octave) - keyWidth / 2;
      let y = height - pianoHeight; // Align keys with the top of the piano area
      blackKeys.push(new BlackKey(x, y, keyWidth, keyHeight));
    }
  }

  particle = new Particle();

  noCursor();

// Initialize the audio recorder
  recorder = new p5.SoundRecorder();
  soundFile = new p5.SoundFile();

  // Check if microphone is available
  let mic = new p5.AudioIn();
  mic.start(() => {
    recorder.setInput(mic);
    console.log("Microphone initialized and ready for recording.");
  }, () => {
    console.error("Microphone access denied.");
  });


// Create the "Save Recording" button
  savePopupButton = createButton("Save Recording");
  stylePopupButton(savePopupButton, "#AF00B3"); // Save button style (green)
  savePopupButton.mousePressed(() => {
    if (soundFile && soundFile.duration() > 0) {
      soundFile.save("my_recording.wav");
      console.log("Audio saved!");
    } else {
      console.error("No recording to save.");
    }
    hidePopupButtons();
  });

  // Create the "Discard Recording" button
  discardPopupButton = createButton("Discard Recording");
  stylePopupButton(discardPopupButton, "#635959"); // Discard button style (red, like "Help?")
  discardPopupButton.mousePressed(() => {
    if (soundFile) {
      soundFile.stop();
      soundFile = null;
      console.log("Recording discarded.");
    }
    hidePopupButtons();
  });

  // Initially hide both buttons
  hidePopupButtons();


 // Initialize the Help button
  let helpButton = createButton("Help?");
  helpButton.style("padding", "10px 25px");
  helpButton.style("font-size", "17px");
  helpButton.style("background-color", "#635959"); // Dark color for the button
  helpButton.style("color", "white");
  helpButton.style("border", "none");
  helpButton.style("border-radius", "12px");
  helpButton.style("cursor", "pointer");
  helpButton.style("position", "absolute");
  helpButton.position(width / 2 + 64, height - height * 0.11); // Place it next to the "Record" button

  // When clicked, show the instructions overlay
  helpButton.mousePressed(() => {
    document.getElementById("instructions-overlay").style.display = "flex";
  });
}

function closeInstructionsOverlay() {
  document.getElementById("instructions-overlay").style.display = "none";
} //////END OF FUNCTION SETUP

function stylePopupButton(button, color) {
  button.style("padding", "10px 20px");
  button.style("font-size", "26px");
  button.style("background-color", color);
  button.style("color", "white");
  button.style("border", "none");
  button.style("border-radius", "12px"); // Updated border-radius for rounded corners
  button.style("cursor", "pointer");
  button.style("display", "none");
  button.style("position", "absolute");
}

function showPopupButtons() {
  // Calculate the center position for the buttons
  let buttonWidth = 200; // Assumed width of the buttons
  let buttonHeight = 40; // Assumed height of each button
  let gap = 24; // Gap between buttons
  
  // Center the buttons horizontally
  let centerX = width / 2 - buttonWidth / 2;
  
  // Position the Save button
  savePopupButton.position(centerX, height / 2 - buttonHeight / 2 - gap / 2);
  savePopupButton.style("display", "block");

  // Position the Discard button, stacked below
  discardPopupButton.position(centerX, height / 2 + buttonHeight / 2 + gap / 2);
  discardPopupButton.style("display", "block");
}


function hidePopupButtons() {
  savePopupButton.style("display", "none");
  discardPopupButton.style("display", "none");
}



function draw() {
  background(254, 240, 255); // Background color

  for (let wall of walls) {
    wall.show();
  }

  for (let key of blackKeys) {
    key.show();
    if (keyIsPressed) {
      key.castRays(particle.pos);
    }
  }

  // Update particle position and behavior
  if (keyIsPressed) {
    particle.update(keyX, keyY);
  } else {
    particle.update(mouseX, mouseY);
  }

  particle.show();
  particle.look(walls);

  // Draw instructions and UI elements (unchanged)
 // Calculate the "wiggle" effect using sin() function
  let wiggleX = sin(frameCount * wiggleSpeed +10) * wiggleAmount; // Horizontal wiggle
  let wiggleY = cos(frameCount * wiggleSpeed) * wiggleAmount; // Optional vertical wiggle, if you want more movement
  
  textFont (myFont)
  fill(203, 76, 217);
  textSize(28);
  textAlign(CENTER, CENTER);

  // Draw the text with a slight wiggle
  text("Play a song", width / 2 + wiggleX, height / 25 + wiggleY);
  
  // Other drawing code...


  ///textSize(32);
  ///text("| A, S, D, A | D, F, G*| D, F, G* |", width / 2, height / 14);

  let buttonWidth = 120;
  let buttonHeight = 40;
  let buttonY = height - height * 0.11;
  let gap = 24;
  let buttonX1 = width / 2 - buttonWidth - gap / 2;
  let buttonX2 = width / 2 + gap / 2;

  if (isRecording) {
    fill(169, 169, 169);
  } else {
    fill(51, 0, 2);
  }
  noStroke();
  rect(buttonX1, buttonY, buttonWidth, buttonHeight, 12); ///////RECORD BUTTTON

  ///fill(99, 89, 89);
  ///rect(buttonX2, buttonY, buttonWidth, buttonHeight, 12);

  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  if (isRecording) {
    text("Stop", buttonX1 + buttonWidth / 2, buttonY + buttonHeight / 2);
  } else {
    text("Record", buttonX1 + buttonWidth / 2, buttonY + buttonHeight / 2);
  }
  ///text("Help ?", buttonX2 + buttonWidth / 2, buttonY + buttonHeight / 2);    //////HELP BUTTON

  fill(247, 161, 255); ///////CURSOR
  noStroke();
  ellipse(mouseX, mouseY, 40, 40); // Mouse ellipse
  
} //////END OF FUNCTION DRAW

function mousePressed() {
  let buttonWidth = 120;
  let buttonHeight = 40;
  let buttonY = height - height * 0.11;
  let gap = 24;
  let buttonX1 = width / 2 - buttonWidth - gap / 2;

  // Recording Button
  if (mouseX > buttonX1 && mouseX < buttonX1 + buttonWidth && mouseY > buttonY && mouseY < buttonY + buttonHeight) {
    if (!isRecording) {
      if (recorder) {
        recorder.record(soundFile);
        isRecording = true;
        console.log("Recording started...");
      } else {
        console.error("Recorder is not initialized.");
      }
    } else {
      recorder.stop();
      isRecording = false;
      console.log("Recording stopped.");

      // Show the save and discard buttons as a pop-up
      showPopupButtons();
    }
  }
}


///////KEYBOARD INTERACTION!!!!
function keyPressed() {


  if (key === "A" || key === "a") {
    keyX = pianoWidth / 5.4;
    keyY = pianoHeight / 1.3;
    doSound.play();
    rayColor = color(51, 0, 2);  // Color when "A" key is pressed
  }
  if (key === "S" || key === "s") {
    keyX = pianoWidth / 3.2;
    keyY = pianoHeight / 1.3;
    reSound.play();
    rayColor = color(51, 0, 2);  // Color when "S" key is pressed
  }
  if (key === "D" || key === "d") {
    keyX = pianoWidth / 2.28;
    keyY = pianoHeight / 1.3;
    miSound.play();
    rayColor = color(51, 0, 2);  // Color when "D" key is pressed
  }
  if (key === "F" || key === "f") {
    keyX = pianoWidth / 1.78;
    keyY = pianoHeight / 1.3;
    faSound.play();
    rayColor = color(51, 0, 2);  // Color when "F" key is pressed
  }
  if (key === "G" || key === "g") {
    keyX = pianoWidth / 1.458;
    keyY = pianoHeight / 1.3;
    solSound.play();
    rayColor = color(51, 0, 2);  // Color when "G" key is pressed
  }
  if (key === "H" || key === "h") {
     keyX= pianoWidth/1.23
    keyY= pianoHeight / 1.3
    laSound.play()
  }
  if (key === "J" || key === "j") {
     keyX= pianoWidth/1.067
    keyY= pianoHeight / 1.3
    siSound.play()
  }


} ////////FUNCTION KEYPRESSED ENDS HERE



///////////////////////////////////////////////Walls
class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(51, 0, 2); // Wall color
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

///////////////////////////////////////////////BlackKey
class BlackKey {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.edges = [
      new Boundary(x, y, x + w, y),
      new Boundary(x + w, y, x + w, y + h),
      new Boundary(x + w, y + h, x, y + h),
      new Boundary(x, y + h, x, y)
    ];
  }

  show() {
    fill(51, 0, 2); // Black key color
    noStroke();
    rect(this.x, this.y, this.w, this.h);
  }

  castRays(source) {
    for (let edge of this.edges) {
      const pt = new Ray(createVector(source.x, source.y), 0).cast(edge);
      if (pt) {
        stroke(100, 100, 255, 150); // Light ray color
        ///line(source.x, source.y, pt.x, pt.y);
      }
    }
  }
}

///////////////////////////////////////////Rays
class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  show() {
    stroke(rayColor); // Use the global ray color
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  
  // The rest of the Ray class remains the same


  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}

////////////////////////////////////////////////////Particles
class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let a = 0; a < 360; a += rayCount) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

 look(walls) {  
  for (let i = 0; i < this.rays.length; i++) {
    const ray = this.rays[i];
    let closest = null;
    let record = Infinity;

    for (let wall of walls) {
      const pt = ray.cast(wall);
      if (pt) {
        const d = p5.Vector.dist(this.pos, pt);
        if (d < record) {
          record = d;
          closest = pt;
        }
      }
    }

    // Adjust ray length to ellipse radius if no key is pressed
    if (!keyIsPressed) {
      record = min(record, this.radius); // Limit to radius
    }

    if (record < Infinity) {
      const endPoint = closest || p5.Vector.add(this.pos, p5.Vector.mult(ray.dir, record));

      // Set ray color
      if (!keyIsPressed) {
        stroke(254, 240, 255); // Background color RAYS THAT FOLLOW THE MOUSE
      } else {
        stroke(51, 0, 2); // Ray color for key press RAYS SHOWN IN THE PIANO INTERACTION
      }
      line(this.pos.x, this.pos.y, endPoint.x, endPoint.y);
    }
  }
}

  show(enableRays = false) {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 20, 20); // Draw the mouse ellipse
    if (enableRays) {
      for (let ray of this.rays) {
        ray.show();
      }
    }
  }
}

// Function to generate random particles and animate them
function createParticles(container, particleCount = 100) {
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = `${Math.random() * window.innerWidth}px`;
    particle.style.top = `${Math.random() * window.innerHeight}px`;
    particle.style.animationDelay = `${Math.random() * 0.5}s`; // Slight delay for randomness
    container.appendChild(particle);

    // Remove the particle after the animation completes
    particle.addEventListener("animationend", () => particle.remove());
  }
}

// Dissolve the overlay on click
document.getElementById("overlay").addEventListener("click", function () {
  const overlay = this;

  // Create particles
  createParticles(document.body, 200);

  // Remove the overlay itself
  setTimeout(() => overlay.remove(), 1500);
});