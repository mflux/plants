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

let debugText;

// P5.js sketch.
function setup() {
  frameRate(10000);
  if(debugBrain){
    frameRate(3);
  }
  //
  pixelDensity(1);
  noSmooth();
  const canvas = createCanvas(SIM_WIDTH, SIM_HEIGHT);
  canvas.style("transform", "scale(2) translate(25%, 25%)");
  canvas.style("image-rendering", "pixelated");

  remakeGrids();
  restartEvolution();

  debugText = createP('Nothing');
  debugText.style('font-size', '16px');
  debugText.position(10, 10);
}

let lastStepTime = 0;

function draw() {
  stepEvolution();
  fill(0)
  background(1, 1, 1);
  // Place pixels based on the grid.
  loadPixels();

  renderGrid(grids.earth, (index, value) => {
    switch (value) {
      case SoilType.None:
      return color(255, 255, 255);
      case SoilType.Soft:
      // Color soil differently depending on moisture.
      const moisture = grids.moisture.cells[index];
      return color(75 + 30 * moisture, 42 + 30 * moisture, 22 + 30 * moisture);
      case SoilType.Hard:
      return color(54, 52, 51);
      default:
      return color(255, 255, 0);
    }
  });

  renderGrid(grids.plantMatter, (index, value) => {
    if (value != null) {
      return color(200, 0, 0);
    }
  });

  updatePixels();

  timeDelta = millis() - lastStepTime;
  lastStepTime = millis();

  debugText.html(`
  <pre>
  Frame time:       ${timeDelta}
  Reward (roots):   ${PP.roots.length}
  Root pick:        ${PP.rootPick}
  Plant age:        ${PP.age}
  Internal neurons: ${PP.InternalNeurons}
  </pre>
  `);
}

function brrrrrrr() {
  n = 100000;
  console.time('sim')
  for (let i = 0; i < n; i++){
    stepEvolution();
  }
  console.timeEnd('sim');
}