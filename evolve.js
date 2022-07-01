const GIVE_UP_AGE = 20;

// Resets evolution upon reaching this age.
var MAX_PLANT_AGE = 1500;

let PP;// one plant for testing, later make an array instead

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

  GSEQ = ['4C2E80A9', 'B4556A64', '93BAA18C', '5ADD329C', 'E011A1A8', '98FCA112', '27F946DC', '942EC07C', '08C4ABB5', 'DCD6ABE2', 'D8FAA5CE', '2AE84BF2', '7F8BED74', 'BF360034', 'CAFE2638', '1BA0CAD8', '3E8E8279', '014E1DA5'];


  if (bestResult !== undefined) {
    GSEQ = mutateGeneSequence(bestResult.geneSequence);
  }

  PP = spawnPlant(grids.earth, grids.cellAngles, GSEQ);
  return PP;
}

// Called every draw step.
function stepEvolution() {
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
        console.log("New Best Plant " + bestResult.reward + " ammount of moisture");
      }
      else if (result.reward > bestResult.reward) {
        bestResult = result;
        console.log("New Best Plant " + bestResult.reward + " ammount of moisture");
      }

      console.log(PP.GSequence);
    }
    PP = restartEvolution();
  }
}

function rewardFunction(plant) {
  let totalCellsResult = plant.cells.length;
  let totalMoistureResult = grids.moisture.computeTotalMoistureForIndices(plant.cells)
  return round(totalMoistureResult / 10000) + totalCellsResult;
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
