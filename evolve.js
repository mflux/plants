const GIVE_UP_AGE = 20;

// Resets evolution upon reaching this age.
const MAX_PLANT_AGE = 1500;

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
  grids.rootAngles = new ValueGrid(SIM_WIDTH, SIM_HEIGHT);
}

function restartEvolution() {
  remakeGrids();

  // create one plant for testing
  let GSEQ = makeRandomGeneSequence();
  // GSEQ = ['08801088', '483816D3', 'DDAF06F8', 'DE0C2928', 'E623EAC8', '95889932', '9296501C', '68F4E915'];
  // GSEQ = ['C6438214', '060BE4FE', 'F1B8D65C', '0E1EB8FE', '80A60DE8', 'F7BBFA08', '9FBD40DA'];
  // GSEQ = ['A47E7D36', '9640BAE8', 'E659C86C', '0C43523E', '03BD28EE', '001C8036', 'D7C2FD56', '075B0232', '0495D1A8', '37AEBBB8', '092521F6', '45654ABE', '110D31AC', '0EA93979', '376F75F2', '045EA449', 'A654446A', '09EC6546', '05AAD05A', '418AD793', '75601B07', '0071A956', '0A1CB7D6', '00E551F6', 'DB425A3A', '2B7255FB', '4243BEDC', '0BB98698', '043C688E', '5D926EF8', '01BFA6B1', '01EEF906', '216C2E28', '9A0D8C2A', '0F805EC6', '094982D6', '0852CC72', 'C4566086'];
  // GSEQ = ['01F2A432', '3E2F2328', '97A106DA', '00781C05', '07BC208A', '0E3E1E69', '944E6482', '0A183698', '088482C2', '78B41CE4', '44647028', '09347E61', '0965D652', '07902D3C', '85E6DE0C', '504E0DA6', 'A073892C', '013884BE', '042E57FA', '0B9FA77E']
  // GSEQ = ['01D2F4EC', '3E2F2328', 'F5DA1814', '00781C05', '07BC208A', '0E3E1E69', '944E6482', '0A183698', '04802777', '78B41CE4', 'E8ED3C4E', '09347E61', '0965D652', '07902D3C', '85E6DE0C', '646AF80A', 'EBD1D0FE', '013884BE', 'B6E1D54A', '02EFFAA5'];
  // ['0753E434', '9C5F3888', '018888E2', '0CEC2A48', '010442DC', 'C33C0698', '096080AC', '07D5FFFA', '0B2EB267', '06923CAC', '0BE7BE2C', '0F344749', '70D717AC', '076F6A84', '03306BF7', '0CE447B6', '0672D24D', 'F61E65A4', '0F811A9A']
  // GSEQ = ['D428B404', '8EE7EBEA', '1983EA02', '59DA6C5F', '86A4A4A4', '61D1C86A', '090C4B15', 'AE07B354', '068B2C5C', '362564BE', '3777782A', 'BE1B8952', '0E853D48', 'B08FF8F7', '0A2EA3A8', '278045E4', '1B709BEE', '7B0DEA96', '11EB0096', 'A20F7D33', '7F60F5AA', 'C7581AD2', '64EC60CC', '620761C1', '42477078', 'A366F138', '17012DA8'];

  // GSEQ = ['BA4B35DC', '54ADFE58', '97C1AA5A', '1D0C5894', '86A4A4A4', '75D23B39', '0BFAAB8A', 'C7D1C357', '050CFED1', '5826E1DA', 'E88F935A', '6D408CC4', '44C2BD8E', '6A22E787', '229E902C', 'D382AD7E', '64F9A03F', 'ACA6940E', '8C8AACAC', 'E9663064', '7E0166A8', '9C01B52C', '0D556846', '3CFDA292', '069B6C9C', '0348CBBC', 'F9B00BC8']

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
  let totalRootsResult = plant.roots.length;
  let totalMoistureResult = grids.moisture.computeTotalMoistureForIndices(plant.roots)
  return round(totalMoistureResult / 10000) + totalRootsResult;
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
