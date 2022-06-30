const SIM_WIDTH = 256;
const SIM_HEIGHT = 256;
const maxCycles = 1000;

var debugBrain = false;
var mostRootsFound = -1;
var bestGenes = [];

let PP;// one plant for testing, later make an array instead

// A dict of grids, each representing a grid of data.
// Instantiated on setup().
const grids = {};

// P5.js sketch.
function setup() {
  if(debugBrain){
    frameRate(3);
  }
  //
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

  // let GSEQ =  ['01F2A432', '3E2F2328', '97A106DA', '00781C05', '07BC208A', '0E3E1E69', '944E6482', '0A183698', '088482C2', '78B41CE4', '44647028', '09347E61', '0965D652', '07902D3C', '85E6DE0C', '504E0DA6', 'A073892C', '013884BE', '042E57FA', '0B9FA77E']
// let GSEQ = ['01D2F4EC', '3E2F2328', 'F5DA1814', '00781C05', '07BC208A', '0E3E1E69', '944E6482', '0A183698', '04802777', '78B41CE4', 'E8ED3C4E', '09347E61', '0965D652', '07902D3C', '85E6DE0C', '646AF80A', 'EBD1D0FE', '013884BE', 'B6E1D54A', '02EFFAA5'];
   // ['0753E434', '9C5F3888', '018888E2', '0CEC2A48', '010442DC', 'C33C0698', '096080AC', '07D5FFFA', '0B2EB267', '06923CAC', '0BE7BE2C', '0F344749', '70D717AC', '076F6A84', '03306BF7', '0CE447B6', '0672D24D', 'F61E65A4', '0F811A9A']

  if(mostRootsFound > 1){
    GSEQ = MuttateGene(bestGenes)
  }
  
  PP = spawnPlant(grids.earth,grids.rootAngles, GSEQ);
}

function draw() {
  // PP.simulate();
  PP.runBrain();

if(PP.age > 20 && PP.roots.length == 1){  // give up early if no growth 
  setup();
}

  if(PP.age> 100){ // reset condition after 500 steps. 
    if(PP.roots.length > mostRootsFound){ // check to see if roots grew greater then last recorded
      bestGenes = PP.GSequence; 
      mostRootsFound = PP.roots.length
      console.log("New Best Plant " + mostRootsFound + " number of roots")
      console.log(PP.GSequence)
    }
    setup();
  }

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
  textSize(10);
  text('Root Pick : ' + PP.rootPick, 20, 20);
  text('plant age : ' + PP.age, 20, 40);
  text('internal neurons : ' + PP.InternalNeurons, 20, 60);
  text('roots : ' + PP.roots.length, 20, 80);
  
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

	numberOfGenes = int(random(5,124));

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