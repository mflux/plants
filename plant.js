class Plant {
  constructor(initialPlantX, initialPlantY, plantMatterGrid, earthGrid) {
    this.plantMatterGrid = plantMatterGrid;
    this.earthGrid = earthGrid;

    this.roots = [];

    // this.makeNewRoot(initialPlantX, initialPlantY);

    this.makeNewRoot(createVector(initialPlantX, initialPlantY),createVector(initialPlantX, initialPlantY+1));


    this.health = 100;
    this.growth = 0;
    this.spreadAngle = 60;
    this.minGrowDistance = 1;
    this.maxGrowDistance = 15;
    this.pickRootRange = 50;
  }

  simulate() {
    this.growth += 1;

    if (this.growth > 1) {
      this.growth -= 1;
      this.attemptToGrow();
    }
  }

  attemptToGrow() {
    let foundRoot = false;

    for (var i = 0; i < 1000; i++) {
      if(foundRoot == false){

        const spreadAngle = this.spreadAngle;
        const myDegrees = map(random(), 0, 1, 90 + spreadAngle, 90 - spreadAngle);
        const moveAmount = int(random(this.minGrowDistance, this.maxGrowDistance));
        const dirVec = p5.Vector.fromAngle(radians(myDegrees), moveAmount);
        dirVec.x = int(dirVec.x)
        dirVec.y = int(dirVec.y)

        const rootRange = constrain(this.roots.length - this.pickRootRange, 0, this.roots.length)

        // Pick only from the past 50 root pixels.
        let rootPick = int(random(rootRange, this.roots.length));

        const rootVector = this.plantMatterGrid.indexToVector(this.roots[rootPick]);
        let nextPossibleRoot = p5.Vector.add(rootVector, dirVec);
        let earthType =  this.earthGrid.get(nextPossibleRoot.x, nextPossibleRoot.y);
        if (doesPlantExistAtIndex(this.roots[rootPick]) && earthType == SoilType.Soft) {
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
        this.plantMatterGrid.set(midPos.x, midPos.y, this);
        this.roots.push(this.plantMatterGrid.xyToIndex(midPos.x, midPos.y));
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
function spawnPlant(earthGrid) {
  const plantX = int(random(earthGrid.width));
  const plantY = searchForAppropriatePlantY(plantX, earthGrid);
  return new Plant(plantX, plantY, grids.plantMatter, earthGrid);
}