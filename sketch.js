const SIM_WIDTH = 256;
const SIM_HEIGHT = 256;

// A dict of grids, each representing a grid of data.
const grids = {
  earth: new Earth(SIM_WIDTH, SIM_HEIGHT, SoilType.Soft),
  moisture: new Moisture(SIM_WIDTH, SIM_HEIGHT, 0.0)
};

// Renders a grid with a callback on how to handle each cell->color.
function renderGrid(grid, colorFunc) {
  grid.forEachIndexValue((gridIndex, value) => {
    c = colorFunc(gridIndex, value);
    pixelIndex = gridIndex * 4;
    pixels[pixelIndex] = red(c);
    pixels[pixelIndex+1] = green(c);
    pixels[pixelIndex+2] = blue(c);
    pixels[pixelIndex+3] = alpha(c);
  });
}


// P5.js sketch.

function setup() {
  pixelDensity(1);
  createCanvas(SIM_WIDTH, SIM_HEIGHT);

  // Generate some soil.
  const earthNoiseScale = 0.01;
  grids.earth.replaceEachXYValue((x, y, _) => {
    const v = noise(x * earthNoiseScale * 10, y * earthNoiseScale * 20);
    if (y < v * SIM_HEIGHT) {
      return SoilType.None;
    }
    if (v > 0.6) {
      return SoilType.Hard;
    }
    return SoilType.Soft;
  });

  // Generate moisture.
  const moistureNoiseScale = 0.003;
  grids.moisture.replaceEachXYValue((x, y, _) => {
    const v = noise(x * moistureNoiseScale * 10, y * moistureNoiseScale * 20);
    const soilType = grids.earth.get(x, y);
    if (soilType == SoilType.Soft) {
      return v;
    }
    return 0;
  });

}

function draw() {
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
  updatePixels();
}