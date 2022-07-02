const GIVE_UP_AGE = 20;

// Resets evolution upon reaching this age.
var MAX_PLANT_AGE = 50000;

// If a plant hasn't grown for this many steps, stop stepping.
const PLANT_AGE_TIMEOUT = 200;

let PP;// one plant for testing, later make an array instead

// A dict of grids, each representing a grid of data.
// Instantiated on setup().
const grids = {};

let bestResult;
var bestGenes = [];

class Result {
  constructor(geneSequence, reward, img) {
    this.geneSequence = geneSequence;
    this.reward = reward;
    this.image = img;
  }
}

let results = [];

let enteredResult = null;

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
  // GSEQ = ["00B17AEE","8CCE4D3D","6293D24E","0615B9B7","9D0448B8","02C8B368","E242B96B","2A8F1ABC","AFC0B648","4FC22F0C"];
  // GSEQ = ["4BA1C7D4","D8562EAC","2F043818","06496C88","B6B989C2","A797659B","FAB97D43","0E87BBC9","D6D86ADC","0E1F1913","D96689FE","D22799A1","7F92B878","8339BC9C","243DD132","09B8B10E","B29D8FF8","8D98AA18","BD443B38"]

  if (enteredResult != null) {
    GSEQ = enteredResult;
    results = [];
    enteredResult = null;
  }
  else {
    if (bestResult !== undefined) {
      GSEQ = mutateGeneSequence(bestResult.geneSequence);
    }
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

  if (PP.age > MAX_PLANT_AGE || (PP.age - PP.lastGrownAge) > PLANT_AGE_TIMEOUT) {
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
  let aboveGroundCells = plant.cells.filter(index => {
    return plant.grids.earth.cells[index] === SoilType.None;
  });
  return totalCellsResult + aboveGroundCells.length * 6;
}

function finishEvolution(geneSequence, reward) {
  renderScene();
  const result = new Result(geneSequence, reward, get().canvas);
  results.push(result);

  results.sort((a, b) => {
    return b.reward - a.reward;
  });

  results = results.slice(0, 20);
  generateResultsPage();
  return result;
}

function generateResultsPage() {
  const resultsList = document.getElementById("results");
  resultsList.innerHTML = "";
  results.forEach(result => {
    const stringifiedSequence = JSON.stringify(result.geneSequence);
    const resultPanel = document.createElement("div");

    const copyButton = document.createElement("button");
    copyButton.onclick = function () {
      copySequenceToClipboard(stringifiedSequence);
    }
    copyButton.innerText = "📋";
    resultPanel.innerHTML = `
      <pre>${stringifiedSequence}</pre>
      <div>Reward: ${result.reward}</div>
    `;
    resultPanel.appendChild(copyButton);
    resultPanel.appendChild(result.image);
    resultsList.appendChild(resultPanel);
  });
}

function copySequenceToClipboard(seq) {
  navigator.clipboard.writeText(seq);
}

// Returns a copy of geneIn with one modified synapse.
function mutateGeneSequence(geneIn) {
  const geneOut = geneIn.slice();

  let randomRun = round(random(mutation_ammount));
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

  numberOfGenes = int(random(16, 45));

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
