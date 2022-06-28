class Plant {
  constructor(initialPlantX, initialPlantY, plantMatterGrid, earthGrid, genomeSequenceIn) {
    this.plantMatterGrid = plantMatterGrid;
    this.earthGrid = earthGrid;

    this.roots = [];

    // this.makeNewRoot(initialPlantX, initialPlantY);

    this.makeNewRoot(createVector(initialPlantX, initialPlantY),createVector(initialPlantX, initialPlantY+1));

    console.log(genomeSequenceIn)

    this.health = 100;
    this.internalClock = 0;
    this.clockSpeed = 0.1;
    this.responsiveness = 1;

    this.brains = [];
    this.InternalNeurons = [0, 0, 0];

    this.energy = 10;
    this.spreadAngle = 100;


    this.minGrowDistance = 1;
    this.maxGrowDistance = 15;

    this.growDistance = 10;


    this.pickRootRange = 50;

    this.age = 0;
    this.alive = true;

    this.rootPick = 0;

    for (var intI = 0; intI < genomeSequenceIn.length; intI++) {
        let synapse = new ABrain(genomeSequenceIn[intI]);
        this.brains.push(synapse);
      }

  }

  simulate() {

    print(this.energy)
    this.energy += 1;

    if (this.energy > 1) {
      this.energy -= 1;
      this.attemptToGrow();
    }
  }

  runBrain() {
    for (let s in this.brains) {
      this.brains[s].RunSynapse(this);
    }
    this.age += 1;
    // this.energy-=.1
  }


  attemptToGrow() {
    let foundRoot = false;

    for (var i = 0; i < 1000; i++) {
      if(foundRoot == false){

        const spreadAngle = this.spreadAngle;
        const myDegrees = map(random(), 0, 1, 90 + spreadAngle, 90 - spreadAngle);
        // const moveAmount = int(random(this.minGrowDistance, this.maxGrowDistance));
        // const moveAmount
        const dirVec = p5.Vector.fromAngle(radians(myDegrees), this.growDistance);
        dirVec.x = int(dirVec.x)
        dirVec.y = int(dirVec.y)

        const rootRange = constrain(this.roots.length - this.pickRootRange, 0, this.roots.length)

        // Pick only from the past 50 root pixels.
        // this.rootPick = int(random(this.rootRange, this.roots.length));

        const rootVector = this.plantMatterGrid.indexToVector(this.roots[this.rootPick]);
        let nextPossibleRoot = p5.Vector.add(rootVector, dirVec);


        let earthType =  this.earthGrid.get(nextPossibleRoot.x, nextPossibleRoot.y);
        if (doesPlantExistAtIndex(this.roots[this.rootPick]) && earthType == SoilType.Soft) {
          foundRoot = true;
           this.makeNewRoot(rootVector, nextPossibleRoot);
          break;
        }
      }
    }
  }

   makeNewRoot(fromPos,toPos) {

    let d =fromPos.dist( toPos);

    for (let index = 0; index < d; index++) {
        let inc = index/d;
        let midPos = p5.Vector.lerp(fromPos, toPos, inc);

        let earthType =  this.earthGrid.get(midPos.x, midPos.y);
        if(earthType == SoilType.Soft) {
            this.plantMatterGrid.set(midPos.x, midPos.y, this);
            this.roots.push(this.plantMatterGrid.xyToIndex(midPos.x, midPos.y));
        }else{
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
function spawnPlant(earthGrid, genomeSequence) {
  const plantX = int(random(earthGrid.width));
  const plantY = searchForAppropriatePlantY(plantX, earthGrid);
  return new Plant(plantX, plantY, grids.plantMatter, earthGrid, genomeSequence);
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