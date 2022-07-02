class Plant {
  constructor(initialPlantX, initialPlantY, grids, genomeSequenceIn) {
    this.grids = grids;

    this.cells = [];

    // this.makeNewRoot(initialPlantX, initialPlantY);

    this.makeNewCell(createVector(initialPlantX, initialPlantY), createVector(initialPlantX, initialPlantY + 1));

    // console.log(genomeSequenceIn)

    this.GSequence = genomeSequenceIn

    this.health = 100;
    this.availableMoistureForGrowth = 0;
    this.internalClock = 0;
    this.clockSpeed = 0.1;
    this.responsiveness = 1;

    this.brains = [];
    this.InternalNeurons = [0, 0, 0, 0, 0, 0];

    //  TODO(Harvey): Read by brain but currently not modified.
    this.energy = 10;
    this.spreadAngle = 100;

    this.minGrowDistance = 1;
    this.maxGrowDistance = 1;

    this.growDistance = 10;
    this.growDirection = 0;


    this.rootRange = 10;

    this.age = 0;
    this.alive = true;

    this.cellPick = 0;

    for (var intI = 0; intI < this.GSequence.length; intI++) {
      let synapse = new ABrain(this.GSequence[intI]);
      this.brains.push(synapse);
    }

  }

  stepSim() {
    // Moisture becomes depleted for each cell consuming.
    this.cells.forEach(index => {
      this.availableMoistureForGrowth -= 0.0001;
      if (this.grids.moisture.cells[index] > 0) {
        const absorbed = this.grids.moisture.cells[index];
        this.availableMoistureForGrowth += absorbed;
        this.grids.moisture.cells[index] -= absorbed * 0.2;
      }
      if (this.grids.moisture.cells[index] < 0) {
        this.grids.moisture.cells[index] = 0;
      }
    });

    // this.grids.moisture.cells.forEach((v, index) => {
    //   if (random() > 0.95) {
    //     this.grids.moisture.cells[index] += random(0, 0.001);
    //   }
    // });

    this.availableMoistureForGrowth = max(this.availableMoistureForGrowth, 0);
  }

  runBrain() {
    if (debugBrain) console.log("===============START BRAIN===============");
    for (let s in this.brains) {
      this.brains[s].RunSynapse(this);
    }
    if (debugBrain) console.log("===============END BRAIN===============")
    this.age += 1;
    // this.energy-=.1
  }

  attemptToGrowBranch() {
    if (this.availableMoistureForGrowth < 0.01) {
      return;
    }
    const spreadAngle = this.spreadAngle;
    const myDegrees = map(random(), 0, 1, 90 - spreadAngle, 90 + spreadAngle);
    const dirVec = p5.Vector.fromAngle(radians(myDegrees), 2.5);
    dirVec.x = round(dirVec.x)
    dirVec.y = round(dirVec.y)

    const branchCellVector = this.grids.plantMatter.indexToVector(this.cells[this.cellPick]);

    if (branchCellVector.y < 20) {
      return
      console.log(this.cellPick)
      console.log(branchCellVector)
    }

    const nextPossibleCell = p5.Vector.add(branchCellVector, dirVec);

    const nextPossibleIndex = this.grids.plantMatter.xyToIndex(nextPossibleCell.x, nextPossibleCell.y);
    let earthType = this.grids.earth.get(nextPossibleCell.x, nextPossibleCell.y);
    if (doesPlantExistAtIndex(nextPossibleIndex) === false && earthType === SoilType.None) {
      this.makeNewCell(branchCellVector, nextPossibleCell);
    }
  }

  attemptToGrowRoot() {
    if (this.availableMoistureForGrowth < 0.01) {
      return;
    }
    const spreadAngle = this.spreadAngle;
    const myDegrees = map(random(), 0, 1, 90 + spreadAngle, 90 - spreadAngle);
    const dirVec = p5.Vector.fromAngle(radians(myDegrees), 1);
    dirVec.x = round(dirVec.x)
    dirVec.y = round(dirVec.y)
    const rootVector = this.grids.plantMatter.indexToVector(this.cells[this.cellPick]);
    const nextPossibleRoot = p5.Vector.add(rootVector, dirVec);
    const nextPossibleIndex = this.grids.plantMatter.xyToIndex(nextPossibleRoot.x, nextPossibleRoot.y);
    let earthType = this.grids.earth.get(nextPossibleRoot.x, nextPossibleRoot.y);
    if (doesPlantExistAtIndex(nextPossibleIndex) === false && earthType === SoilType.Soft) {
      this.makeNewCell(rootVector, nextPossibleRoot);
    }
  }

  makeNewCell(fromPos, toPos) {
    let angle = fromPos.angleBetween(toPos);
    const index = this.grids.plantMatter.xyToIndex(toPos.x, toPos.y);
    this.grids.plantMatter.cells[index] = this;
    this.grids.cellAngles.cells[index] = angle;
    this.grids.cellAge.cells[index] = this.cells.length;
    this.cells.push(index);
    this.availableMoistureForGrowth -= 0.01;
  }

  // Returns true if the plant has grown at all. Else returns false.
  hasGrown() {
    return this.cells.length > 2;
  }

  attemptToKillCell() {
    const toRemoveIndex = this.cells.indexOf(this.cellPick);
    this.cells.splice(toRemoveIndex, 1);
    this.grids.plantMatter.cells[this.cellPick] = null;
  }
}

// Looks for the nearest soft soil, given an x and earth grid.
function searchForAppropriatePlantY(x, earthGrid) {
  let y = 0;
  let tries = 0;
  const maxTries = 10000;
  while (earthGrid.get(x, y) !== SoilType.Soft && tries < maxTries) {
    y += 1;
    tries++;
  }
  return y;
}

// Spawns a plant, given an earth grid.
function spawnPlant(grids, genomeSequence) {
  const plantX = int(random(20, grids.earth.width - 20));
  const plantY = searchForAppropriatePlantY(plantX, grids.earth);
  return new Plant(plantX, plantY, grids, genomeSequence);
}




function computeNormalizedBranchGrowthPotential(index, earthGrid, plantMatterGrid) {
  const [x, y] = earthGrid.indexToXY(index);
  let value = 0;
  earthGrid.forEachXYNeighborValue(x, y, (nx, ny, soilType) => {
    if (soilType === SoilType.None) {
      value += 1;
    }
  });

  return value / 8.0;
}

function computeNormalizedRootGrowthPotential(index, earthGrid, plantMatterGrid) {
  const [x, y] = earthGrid.indexToXY(index);
  let value = 0;
  earthGrid.forEachXYNeighborValue(x, y, (nx, ny, soilType) => {
    if (soilType === SoilType.Soft) {
      value += 1;
    }
  });

  plantMatterGrid.forEachXYNeighborValue(x, y, (nx, ny, plantMatter) => {
    if (plantMatter === null) {
      value += 1;
    }
  });

  return value / 16.0;
}