const SIM_WIDTH = 256;
const SIM_HEIGHT = 256;

let PP;// one plant for testing, later make an array instead

// A dict of grids, each representing a grid of data.
const grids = {
  earth: new Earth(SIM_WIDTH, SIM_HEIGHT, SoilType.Soft),
  moisture: new Moisture(SIM_WIDTH, SIM_HEIGHT, 0.0),
  plantMatter: new PlantMatter(SIM_WIDTH, SIM_HEIGHT)
};

// Renders a grid with a callback on how to handle each cell->color.
function renderGrid(grid, colorFunc) {
  grid.forEachIndexValue((gridIndex, value) => {
    c = colorFunc(gridIndex, value);
    if (c === undefined) {
      return;
    }
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
  noSmooth();
  const canvas = createCanvas(SIM_WIDTH, SIM_HEIGHT);
  canvas.style("transform", "scale(2) translate(25%, 25%)");
  canvas.style("image-rendering", "pixelated");

  // Generate some soil.
  const earthNoiseScale1 = 0.001;
  const earthNoiseScale2 = 0.05;
  grids.earth.fill(SoilType.None);
  for (let x = 0; x < grids.earth.width; x++){
    const v = int(noise(x * earthNoiseScale1) * grids.earth.height * 0.5);
    const v2 = int(noise(x * earthNoiseScale2) * 20);
    for (let y = grids.earth.height * 0.3 + v + v2; y < grids.earth.height; y++){
      grids.earth.set(x, y, SoilType.Soft);
    }
  }

  const rockNoiseScale = 0.02;
  grids.earth.replaceEachXYValue((x, y, value) => {
    if (value === SoilType.Soft) {
      const v = noise(x * rockNoiseScale * 10, y * rockNoiseScale * 20);
      if (v > 0.6) {
        return SoilType.Hard;
      }
      return SoilType.Soft;
    }
    else {
      return SoilType.None;
    }
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