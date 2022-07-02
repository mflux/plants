/*
  Terminology:

  A gene sequence.
  ['01F2A432', '3E2F2328', ...]

  A gene.
  '01F2A432'

  It gets converted into a synapse (brain).
*/

const SIM_WIDTH = 128;
const SIM_HEIGHT = 256;

var debugBrain = false;

let STEPS_PER_FRAME = 1;

let dom_stepsPerFrameSlider;
let dom_debugText;
let dom_fastModeToggle;
let dom_fastForwardButton;
let dom_sequenceEntry;

var FastMode = false;

function onSequenceEntered() {
  enteredResult = JSON.parse(this.value());
  restartEvolution();
}


// P5.js sketch.
function setup() {
  frameRate(10000);
  if (debugBrain) {
    frameRate(3);
  }

  pixelDensity(1);
  noSmooth();
  const canvas = createCanvas(SIM_WIDTH, SIM_HEIGHT);
  canvas.style("transform", "scale(4) translate(25%, 25%)");
  canvas.style("image-rendering", "pixelated");

  remakeGrids();
  restartEvolution();

  const sliderLabel = createP("Steps Per Frame");
  sliderLabel.position(10, 0);
  dom_stepsPerFrameSlider = createSlider(1, 1000, 1, 1);
  dom_stepsPerFrameSlider.position(120, 15);

  dom_fastForwardButton = createButton("Advance 100,000 Steps");
  dom_fastForwardButton.mousePressed(brrrrrrr)
  dom_fastForwardButton.position(10, 40);

  dom_debugText = createP('Nothing');
  dom_debugText.style('font-size', '16px');
  dom_debugText.position(10, 40);

  const entryLabel = createP("Start With Sequence");
  entryLabel.position(300, 0);
  dom_sequenceEntry = createInput("");
  dom_sequenceEntry.position(460, 13);
  dom_sequenceEntry.input(onSequenceEntered);
}

let lastStepTime = 0;

function draw() {
  STEPS_PER_FRAME = dom_stepsPerFrameSlider.value();

  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    stepEvolution();
  }

  renderScene();

  timeDelta = millis() - lastStepTime;
  lastStepTime = millis();

  dom_debugText.html(`
  <pre>
  Reward:           ${rewardFunction(PP)}
  ↪ Cells:            ${PP.cells.length}
  ↪ A-Moisture:       ${PP.availableMoistureForGrowth}
  Root pick:        ${PP.cellPick}
  Plant age:        ${PP.age}
  Internal neurons: ${PP.InternalNeurons}
  Frame time:       ${timeDelta}
  </pre>
  `);

}

function renderScene() {
  fill(0)
  background(1, 1, 1);
  // Place pixels based on the grid.
  loadPixels();

  const drySoilColor = color(138, 121, 107);
  const wetSoilColor = color(54, 34, 17);
  renderGrid(grids.earth, (index, value) => {
    switch (value) {
      case SoilType.None:
        return color(255, 255, 255);
      case SoilType.Soft:
        // Color soil differently depending on moisture.
        const moisture = grids.moisture.cells[index] / 10;
        return lerpColor(drySoilColor, wetSoilColor, moisture);
      case SoilType.Hard:
        return color(54, 52, 51);
      default:
        return color(255, 255, 0);
    }
  });

  const startBranchColor = color(35, 54, 8);
  const endBranchColor = color(94, 230, 16);
  const startRootColor = color(61, 6, 18);
  const endRootColor = color(161, 122, 32);
  renderGrid(grids.plantMatter, (index, value) => {


    if (value != null) {
      const age = grids.cellAge.cells[index];
      const normAge = age * 4 / MAX_PLANT_AGE;
      if (grids.earth.cells[index] === SoilType.None) {
        return lerpColor(startBranchColor, endBranchColor, normAge);
      } else {
        return lerpColor(startRootColor, endRootColor, normAge);
      }

    }
  });

  updatePixels();
}

function brrrrrrr() {
  n = 100000;
  console.time('sim')
  for (let i = 0; i < n; i++) {
    stepEvolution();
  }
  console.timeEnd('sim');
}