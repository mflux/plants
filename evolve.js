const GIVE_UP_AGE = 20;

// Resets evolution upon reaching this age.
var MAX_PLANT_AGE = 50000;

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
  grids.cellAge = new ValueGrid(SIM_WIDTH, SIM_HEIGHT, 0);
}

function restartEvolution() {
  remakeGrids();

  // create one plant for testing
  let GSEQ = makeRandomGeneSequence();

  // GSEQ = ['CA7C2E07', 'A748098E', '3AFE3104', '4D0F2CC4', 'AE097594', '54E3D98C', '1257A868', 'F73A3E36', '1F8FA904', '87EADE94', '3F8A2BE7', 'C9684926', 'F5493544', 'F085339A'];
  // Different strategy?
  // GSEQ = ['083DCC7C', '352DA57C', 'E79D827E', '6021B314', 'BFFFC33C', '127F32DC', '05927A28', '0D981BFE', 'C09F7338', '02CF2265', '20CF6E63', '1F114D53', '67D77482', 'A1687B8B']

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
