class Plant {
  constructor(initialPlantX, initialPlantY, plantMatterGrid, earthGrid, cellAngles, genomeSequenceIn) {
    this.plantMatterGrid = plantMatterGrid;
    this.earthGrid = earthGrid;
    this.cellAngles = cellAngles;

    this.cells = [];

    // this.makeNewRoot(initialPlantX, initialPlantY);

    this.makeNewRoot(createVector(initialPlantX, initialPlantY), createVector(initialPlantX, initialPlantY + 1));

    // console.log(genomeSequenceIn)

    this.GSequence = genomeSequenceIn

    this.health = 100;
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
    const spreadAngle = this.spreadAngle;
    const myDegrees = map(random(), 0, 1, 90 - spreadAngle, 90 + spreadAngle);
    const dirVec = p5.Vector.fromAngle(radians(myDegrees), 2.5);
    dirVec.x = round(dirVec.x)
    dirVec.y = round(dirVec.y)


    const branchCellVector = this.plantMatterGrid.indexToVector(this.cells[this.cellPick]);

    if (branchCellVector.y < 20) {
      return
      console.log(this.cellPick)
      console.log(branchCellVector)
    }



    const nextPossibleCell = p5.Vector.add(branchCellVector, dirVec);

    const nextPossibleIndex = this.plantMatterGrid.xyToIndex(nextPossibleCell.x, nextPossibleCell.y);
    let earthType = this.earthGrid.get(nextPossibleCell.x, nextPossibleCell.y);
    if (doesPlantExistAtIndex(nextPossibleIndex) === false && earthType === SoilType.None) {
      this.makeNewBranch(branchCellVector, nextPossibleCell);
    }
  }

  makeNewBranch(fromPos, toPos) {
    let branchAngleFrom = fromPos.angleBetween(toPos);
    this.plantMatterGrid.set(toPos.x, toPos.y, this);
    this.cellAngles.set(toPos.x, toPos.y, branchAngleFrom)
    this.cells.push(this.plantMatterGrid.xyToIndex(toPos.x, toPos.y));
  }


  attemptToGrowRoot() {
    const spreadAngle = this.spreadAngle;
    const myDegrees = map(random(), 0, 1, 90 + spreadAngle, 90 - spreadAngle);
    const dirVec = p5.Vector.fromAngle(radians(myDegrees), 1);
    dirVec.x = round(dirVec.x)
    dirVec.y = round(dirVec.y)
    const rootVector = this.plantMatterGrid.indexToVector(this.cells[this.cellPick]);
    const nextPossibleRoot = p5.Vector.add(rootVector, dirVec);
    const nextPossibleIndex = this.plantMatterGrid.xyToIndex(nextPossibleRoot.x, nextPossibleRoot.y);
    let earthType = this.earthGrid.get(nextPossibleRoot.x, nextPossibleRoot.y);
    if (doesPlantExistAtIndex(nextPossibleIndex) === false && earthType === SoilType.Soft) {
      this.makeNewRoot(rootVector, nextPossibleRoot);
    }
  }

  makeNewRoot(fromPos, toPos) {
    let rootAngleFrom = fromPos.angleBetween(toPos);
    this.plantMatterGrid.set(toPos.x, toPos.y, this);
    this.cellAngles.set(toPos.x, toPos.y, rootAngleFrom)
    this.cells.push(this.plantMatterGrid.xyToIndex(toPos.x, toPos.y));

  }

  // Returns true if the plant has grown at all. Else returns false.
  hasGrown() {
    return this.cells.length > 2;
  }
}

// Looks for the nearest soft soil, given an x and  earth grid.
function searchForAppropriatePlantY(x, earthGrid) {
  let y = 0;
  let tries = 0;
  const maxTries = 10000;
  while (earthGrid.get(x, y) !== SoilType.Soft && tries < maxTries) {
    y += 1;
    tries++;
  }
  return y - 1;
}

// Spawns a plant, given an earth grid.
function spawnPlant(earthGrid, cellAngles, genomeSequence) {
  const plantX = int(random(20, earthGrid.width - 20));
  const plantY = searchForAppropriatePlantY(plantX, earthGrid);
  return new Plant(plantX, plantY, grids.plantMatter, earthGrid, cellAngles, genomeSequence);
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