/*
  Terminology:

  A gene sequence.
  ['01F2A432', '3E2F2328', ...]

  A gene.
  '01F2A432'

  It gets converted into a synapse (brain).
*/

const SIM_WIDTH = 256;
const SIM_HEIGHT = 256;

var debugBrain = false;

// A dict of grids, each representing a grid of data.
// Instantiated on setup().
const grids = {};

let dom_debugText;
let dom_fastModeToggle;
let dom_fastForwardButton;

var FastMode = false;


function toggleFastMode() {
  if (dom_fastModeToggle.checked()) {
    FastMode = true;
  } else {
    FastMode = false;
  }
}

var simViewGraphics;

// P5.js sketch.
function setup() {
  frameRate(10000);
  if (debugBrain) {
    frameRate(3);
  }

  pixelDensity(1);
  noSmooth();
  simViewGraphics = createGraphics(SIM_WIDTH, SIM_HEIGHT);
  const canvas = createCanvas(SIM_WIDTH * 4, SIM_HEIGHT * 4);
  // canvas.style("transform", "scale(2) translate(25%, 25%)");
  canvas.style("image-rendering", "pixelated");

  remakeGrids();
  restartEvolution();
  dom_fastModeToggle = createCheckbox("FastMode", 0)
  dom_fastModeToggle.position(10, 10);
  dom_fastModeToggle.changed(toggleFastMode);

  dom_fastForwardButton = createButton("Fast Forward");
  dom_fastForwardButton.mousePressed(brrrrrrr)
  dom_fastForwardButton.position(10, 30);

  dom_debugText = createP('Nothing');
  dom_debugText.style('font-size', '16px');
  dom_debugText.position(10, 40);
}

let lastStepTime = 0;

function draw() {
  stepEvolution();
  simViewGraphics.fill(0)
  simViewGraphics.background(1, 1, 1);
  // Place pixels based on the grid.
  simViewGraphics.loadPixels();

  renderGrid(grids.earth, (index, value) => {
    switch (value) {
      case SoilType.None:
        return color(255, 255, 255);
      case SoilType.Soft:
        // Color soil differently depending on moisture.
        const moisture = grids.moisture.cells[index];
        return color(75 + 60 * moisture, 42 + 60 * moisture, 22 + 60 * moisture);
      case SoilType.Hard:
        return color(54, 52, 51);
      default:
        return color(255, 255, 0);
    }
  });

  renderGrid(grids.plantMatter, (index, value) => {


    if (value != null) {

      if (grids.earth.cells[index] === SoilType.None) {
        return color(0, 200, 0);
      } else {
        return color(200, 200, 200);
      }

    }
  });

  simViewGraphics.updatePixels();
  image(simViewGraphics, 0, 0, width, height)

  timeDelta = millis() - lastStepTime;
  lastStepTime = millis();

  dom_debugText.html(`
  <pre>
  Frame time:       ${timeDelta}
  Cells:   ${PP.cells.length}
  Root pick:        ${PP.cellPick}
  Plant age:        ${PP.age}
  Internal neurons: ${PP.InternalNeurons}
  </pre>
  `);

  if (FastMode) {
    for (let i = 0; i < 100; i++) {
      stepEvolution();
    }
  }

}

function brrrrrrr() {
  n = 100000;
  console.time('sim')
  for (let i = 0; i < n; i++) {
    stepEvolution();
  }
  console.timeEnd('sim');
}