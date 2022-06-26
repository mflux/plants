function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

class Plant {
  constructor(x, y) {
    this.id = uuidv4();
    this.roots = [];

    this.newRoot(x, y);

    this.health = 100;
    this.growth = 0;
  }

  runDraw() {
    this.growth += 1;

    if (this.growth > 1) {
      this.growth -= 1;
      this.growRoots();
    }
  }

  growRoots() {

    //
    let foundRoot = false;

    for (var i = 0; i < 1000; i++) {
      if(foundRoot == false){

        let spreadAng = 30;
        let myDegrees = map(random(), 0, 1, 90+spreadAng, 90-spreadAng);
        let ammtMove = int(random(1,5));
        let dirVec = p5.Vector.fromAngle(radians(myDegrees), ammtMove);

        dirVec.x = int(dirVec.x)
        dirVec.y = int(dirVec.y)

        let rootRange = constrain(this.roots.length-50, 0, this.roots.length)

        let rootPick = int(random(rootRange,this.roots.length)); // pick only from the past 50 root pixels

        const rootVector = grids.plantMatter.indexToVector(this.roots[rootPick]);
        let nextPossibleRoot = p5.Vector.add(rootVector, dirVec);
        // print(nextPossibleRoot)

        let earthType =  grids.earth.get(nextPossibleRoot.x, nextPossibleRoot.y);// == SoilType.Soft

        // console.log()

        if (this.checkRootExists(this.roots[rootPick]) && earthType == SoilType.Soft) {
          foundRoot = true;
          this.newRoot(nextPossibleRoot.x, nextPossibleRoot.y);
          break;
        }
      }

    }
    // print("grow roots")
  }

  newRoot(x, y) {
    grids.plantMatter.set(x, y, this.id);
    this.roots.push(grids.plantMatter.xyToIndex(x, y));
  }

  checkRootExists(index) {
    return grids.plantMatter.cells[index] != null;
  }
}
