const SIM_WIDTH = 256;
const SIM_HEIGHT = 256;

let PP;// one plant for testing, later make an array instead

// A dict of grids, each representing a grid of data.
// Instantiated on setup().
const grids = {};

// P5.js sketch.
function setup() {
  pixelDensity(1);
  noSmooth();
  const canvas = createCanvas(SIM_WIDTH, SIM_HEIGHT);
  canvas.style("transform", "scale(2) translate(25%, 25%)");
  canvas.style("image-rendering", "pixelated");

  grids.earth = generateEarth(SIM_WIDTH, SIM_HEIGHT);
  grids.moisture = generateMoistureGrid(SIM_WIDTH, SIM_HEIGHT);
  grids.plantMatter = new PlantMatter(SIM_WIDTH, SIM_HEIGHT);

  // create one plant for testing
  PP = spawnPlant(grids.earth);
}

function draw() {
  PP.simulate();

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
}