const SIM_WIDTH = 256;
const SIM_HEIGHT = 256;
const maxCycles = 1000;

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
  grids.rootAngles = new ValueGrid(SIM_WIDTH,SIM_HEIGHT);

  // create one plant for testing
  let GSEQ = makeRandomGenome();
  PP = spawnPlant(grids.earth,grids.rootAngles, GSEQ);
}

function draw() {
  // PP.simulate();
  PP.runBrain();

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

function MuttateGene(GeneIn) {
	let randPick = int(random(GeneIn.length));
	let digit = random(80000, 5000000);
	let newHex = hex(digit,8).replace('.', '0')
	GeneIn[randPick] = newHex;
	let GeneOut = GeneIn
	
	return GeneOut;
}

function makeRandomGenome(){
	let Genome = []

	numberOfGenes = int(random(12,64));

	for (let b = 0; b < numberOfGenes; b++) {
		let digit = random(80000, 50000000);
		Genome.push(hex(digit, 8).replace('.', '0'));
	}
	
	return Genome
}

function hex2bin(hex) {
  let val = parseInt(hex, 16);
  // console.log(val)
  let binStr = val.toString(2);
  while (binStr.length < 32) {
    binStr = "0" + binStr;
  }
  return binStr;
}

function int2hex(bin) {
  return bin.toString(16);
}