const GIVE_UP_AGE = 20;

// Resets evolution upon reaching this age.
const MAX_PLANT_AGE = 500;

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
  grids.rootAngles = new ValueGrid(SIM_WIDTH,SIM_HEIGHT);
}

function restartEvolution() {
  remakeGrids();

  // create one plant for testing
  let GSEQ = makeRandomGeneSequence();

  // GSEQ = ['01F2A432', '3E2F2328', '97A106DA', '00781C05', '07BC208A', '0E3E1E69', '944E6482', '0A183698', '088482C2', '78B41CE4', '44647028', '09347E61', '0965D652', '07902D3C', '85E6DE0C', '504E0DA6', 'A073892C', '013884BE', '042E57FA', '0B9FA77E']
  // GSEQ = ['01D2F4EC', '3E2F2328', 'F5DA1814', '00781C05', '07BC208A', '0E3E1E69', '944E6482', '0A183698', '04802777', '78B41CE4', 'E8ED3C4E', '09347E61', '0965D652', '07902D3C', '85E6DE0C', '646AF80A', 'EBD1D0FE', '013884BE', 'B6E1D54A', '02EFFAA5'];
  // ['0753E434', '9C5F3888', '018888E2', '0CEC2A48', '010442DC', 'C33C0698', '096080AC', '07D5FFFA', '0B2EB267', '06923CAC', '0BE7BE2C', '0F344749', '70D717AC', '076F6A84', '03306BF7', '0CE447B6', '0672D24D', 'F61E65A4', '0F811A9A']
  // let GSEQ = ['D428B404', '8EE7EBEA', '1983EA02', '59DA6C5F', '86A4A4A4', '61D1C86A', '090C4B15', 'AE07B354', '068B2C5C', '362564BE', '3777782A', 'BE1B8952', '0E853D48', 'B08FF8F7', '0A2EA3A8', '278045E4', '1B709BEE', '7B0DEA96', '11EB0096', 'A20F7D33', '7F60F5AA', 'C7581AD2', '64EC60CC', '620761C1', '42477078', 'A366F138', '17012DA8'];

  if (bestResult !== undefined) {
    GSEQ = mutateGeneSequence(bestResult.geneSequence);
  }

  PP = spawnPlant(grids.earth, grids.rootAngles, GSEQ);
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
    // check to see if roots grew greater then last recorded
    if (bestResult === undefined || PP.roots.length > bestResult.reward) {
      const result = finishEvolution(PP.GSequence, PP.roots.length);
      if (bestResult === undefined) {
        bestResult = result;
        console.log("New Best Plant " + bestResult.reward + " number of roots");
      }
      else if (result.reward > bestResult.reward) {
        bestResult = result;
        console.log("New Best Plant " + bestResult.reward + " number of roots");
      }

      console.log(PP.GSequence);
    }
    PP = restartEvolution();
  }
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

  let randPick = int(random(geneIn.length));
  let digit = random(80000, 5000000);
  let newHex = hex(digit,8).replace('.', '0')
  geneOut[randPick] = newHex;

  return geneOut;
}

// Make a new random gene sequence from scratch.
function makeRandomGeneSequence(){
  let genome = []

  numberOfGenes = int(random(5, 124));

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
