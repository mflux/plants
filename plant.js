class Plant {
  constructor(initialPlantX, initialPlantY, plantMatterGrid, earthGrid, rootAngles, genomeSequenceIn) {
    this.plantMatterGrid = plantMatterGrid;
    this.earthGrid = earthGrid;
    this.rootAngles = rootAngles;

    this.roots = [];

    // this.makeNewRoot(initialPlantX, initialPlantY);

    this.makeNewRoot(createVector(initialPlantX, initialPlantY),createVector(initialPlantX, initialPlantY+1));

    // console.log(genomeSequenceIn)

    this.GSequence = genomeSequenceIn

    this.health = 100;
    this.internalClock = 0;
    this.clockSpeed = 0.1;
    this.responsiveness = 1;

    this.brains = [];
    this.InternalNeurons = [0, 0, 0,0,0,0];

    //  TODO(Harvey): Read by brain but currently not modified.
    this.energy = 10;
    this.spreadAngle = 100;

    this.minGrowDistance = 1;
    this.maxGrowDistance = 1;

    this.growDistance = 10;
    this.growDirection = 0;


    this.pickRootRange = 50;
    this.rootRange = 10;

    this.age = 0;
    this.alive = true;

    this.rootPick = 0;

    for (var intI = 0; intI < this.GSequence.length; intI++) {
      let synapse = new ABrain(this.GSequence[intI]);
      this.brains.push(synapse);
    }

  }

  runBrain() {
    if(debugBrain)console.log("===============START BRAIN===============");
    for (let s in this.brains) {
      this.brains[s].RunSynapse(this);
    }
    if(debugBrain)console.log("===============END BRAIN===============")
    this.age += 1;
    // this.energy-=.1
  }


  attemptToGrow() {
    let foundRoot = false;
        const spreadAngle = this.spreadAngle;
        const myDegrees = map(random(), 0, 1, 90 + spreadAngle, 90 - spreadAngle);
        const dirVec = p5.Vector.fromAngle(radians(myDegrees), 5);// this.growDistance);
        dirVec.x = int(dirVec.x)
        dirVec.y = int(dirVec.y)
        const rootVector = this.plantMatterGrid.indexToVector(this.roots[this.rootPick]);
        let nextPossibleRoot = p5.Vector.add(rootVector, dirVec);
        let earthType =  this.earthGrid.get(nextPossibleRoot.x, nextPossibleRoot.y);
        if (doesPlantExistAtIndex(this.roots[this.rootPick]) && earthType === SoilType.Soft) {
          foundRoot = true;
          this.makeNewRoot(rootVector, nextPossibleRoot);
        }
  }

  makeNewRoot(fromPos,toPos) {

    let d = fromPos.dist(toPos);
    let rootAngleFrom = fromPos.angleBetween(toPos);

    for (let index = 0; index < d; index++) {
      let inc = index/d;
      let midPos = p5.Vector.lerp(fromPos, toPos, inc);

      let earthType = this.earthGrid.get(midPos.x, midPos.y);
      if(earthType == SoilType.Soft) {
        this.plantMatterGrid.set(midPos.x, midPos.y, this);
        this.rootAngles.set(midPos.x, midPos.y,rootAngleFrom)
        this.roots.push(this.plantMatterGrid.xyToIndex(midPos.x, midPos.y));
      }else {
        break;// soil is no longer soft in this direction, so stop root growth
      }
    }
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
  return y;
}

// Spawns a plant, given an earth grid.
function spawnPlant(earthGrid,rootAngles, genomeSequence) {
  const plantX = int(random(earthGrid.width));
  const plantY = searchForAppropriatePlantY(plantX, earthGrid);
  return new Plant(plantX, plantY, grids.plantMatter, earthGrid, rootAngles, genomeSequence);
}

function computeNormalizedGrowthPotential(index, earthGrid, plantMatterGrid) {
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