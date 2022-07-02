const GIVE_UP_AGE = 20;

// Resets evolution upon reaching this age.
var MAX_PLANT_AGE = 10000;

let PP;// one plant for testing, later make an array instead

// A dict of grids, each representing a grid of data.
// Instantiated on setup().
const grids = {};

let bestResult;
var bestGenes = [];

class Result {
  constructor(geneSequence, reward) {
    this.geneSequence = geneSequence;
    this.reward = reward;
  }
}

const results = [];

function remakeGrids() {
  grids.earth = generateEarth(SIM_WIDTH, SIM_HEIGHT);
  grids.moisture = generateMoistureGrid(SIM_WIDTH, SIM_HEIGHT);
  grids.plantMatter = new PlantMatter(SIM_WIDTH, SIM_HEIGHT);
  grids.cellAngles = new ValueGrid(SIM_WIDTH, SIM_HEIGHT);
}

function restartEvolution() {
  remakeGrids();

  // create one plant for testing
  let GSEQ = makeRandomGeneSequence();

  // GSEQ = ['15FF5D04', '7968E1E4', '799697C8', '8BD5206C', 'B93648FE', 'AB7E81BC', '078FC9BA', 'D915F9DA', '8E9E6D2B', 'D3472F8C', '3F8A2BE7', 'A0A1FDBA', '2B369F46', 'BC7187BE'];


  if (bestResult !== undefined) {
    GSEQ = mutateGeneSequence(bestResult.geneSequence);
  }

  PP = spawnPlant(grids, GSEQ);
  return PP;
}

function stepEvolution() {
  PP.stepSim();
  PP.runBrain();

  // give up early if no growth
  if (PP.hasGrown() === false && PP.age > GIVE_UP_AGE) {
    PP = restartEvolution();
  }

  if (PP.age > MAX_PLANT_AGE) {
    if (bestResult === undefined || rewardFunction(PP) > bestResult.reward) {
      const result = finishEvolution(PP.GSequence, rewardFunction(PP));
      if (bestResult === undefined) {
        bestResult = result;
        console.log("New Best Plant " + bestResult.reward + " reward");
      }
      else if (result.reward > bestResult.reward) {
        bestResult = result;
        console.log("New Best Plant " + bestResult.reward + " reward");
      }

      console.log(PP.GSequence);
    }
    PP = restartEvolution();
  }
}

function rewardFunction(plant) {
  let totalCellsResult = plant.cells.length;
  return totalCellsResult;
}

function finishEvolution(geneSequence, reward) {
  const result = new Result(geneSequence, reward);
  results.push(result);

  results.sort((a, b) => {
    return b.reward - a.reward;
  });

  return result;
}

// Returns a copy of geneIn with one modified synapse.
function mutateGeneSequence(geneIn) {
  const geneOut = geneIn.slice();

  let randomRun = round(random(1, 10));
  // adjust a random number of genes.
  for (let index = 0; index < randomRun; index++) {
    let randPick = int(random(geneIn.length));
    let digit = random(80000, 5000000);
    let newHex = hex(digit, 8).replace('.', '0')
    geneOut[randPick] = newHex;
  }
  return geneOut;
}

// Make a new random gene sequence from scratch.
function makeRandomGeneSequence() {
  let genome = []

  numberOfGenes = int(random(5, 20));

  for (let b = 0; b < numberOfGenes; b++) {
    let digit = random(80000, 50000000);
    genome.push(hex(digit, 8).replace('.', '0'));
  }

  return genome
}

function hex2bin(hex) {
  let val = parseInt(hex, 16);
  let binStr = val.toString(2);
  while (binStr.length < 32) {
    binStr = "0" + binStr;
  }
  return binStr;
}

function int2hex(bin) {
  return bin.toString(16);
}
