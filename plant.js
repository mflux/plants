class Plant {
  constructor(initialPlantX, initialPlantY, plantMatterGrid, earthGrid) {
    this.plantMatterGrid = plantMatterGrid;
    this.earthGrid = earthGrid;

    this.roots = [];

    this.makeNewRoot(initialPlantX, initialPlantY);

    this.health = 100;
    this.growth = 0;
    this.spreadAngle = 30;
    this.minGrowDistance = 1;
    this.maxGrowDistance = 5;
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
          this.makeNewRoot(nextPossibleRoot.x, nextPossibleRoot.y);
          break;
        }
      }
    }
  }

  makeNewRoot(x, y) {
    this.plantMatterGrid.set(x, y, this);
    this.roots.push(this.plantMatterGrid.xyToIndex(x, y));
  }
}
