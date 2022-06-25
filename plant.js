class Plant {
    constructor(x, y) {
      this.roots = [];
      this.loc = createVector(x, y);
  
      this.roots.push(createVector(x, y));
  
      this.health = 100;
      this.growth = 0;
    }
  
    runDraw() {

      this.growth += 1;
  
      if (this.growth > 1) {
        this.growth -= 1;
        this.growRoots();
      }
      fill(200,0,0);
      noStroke();
  
      for (let rr = 0; rr < this.roots.length; rr++) {
        rect(this.roots[rr].x, this.roots[rr].y, 1, 1);
      }

    }
  
    growRoots() {
      
      // 
      let foundRoot = false;
  
      for (var i = 0; i < 100; i++) {
        if(foundRoot == false){
        let dirIdx = int(random(0, 7));
        let dirVec = createVector(0, 0);
  
        if (dirIdx == 0) {
          dirVec = createVector(-1, 0);
        } else if (dirIdx == 1) {
          dirVec = createVector(-1, 1);
        } else if (dirIdx == 2) {
          dirVec = createVector(0, 1);
        } 
        else if (dirIdx == 3) {
          dirVec = createVector(1, 1);
        } else if (dirIdx == 4) {
          dirVec = createVector(1, 0);
        }else if (dirIdx == 5) {
          dirVec = createVector(2, 0);
        }else if (dirIdx == 6) {
          dirVec = createVector(-2, 0);
        }
  
        
        let rootRange = constrain(this.roots.length-50, 0, this.roots.length)
        
        let rootPick = int(random(rootRange,this.roots.length));
  
        let nextPossibleRoot = p5.Vector.add(this.roots[rootPick], dirVec);
  
        let earthType =  grids.earth.get(nextPossibleRoot.x, nextPossibleRoot.y);// == SoilType.Soft

        // console.log() 

        if (this.checkRootExists(nextPossibleRoot) && earthType == SoilType.Soft) {
          foundRoot = true;
          this.roots.push(nextPossibleRoot);
          break;
        }
        }
        
      }
      // print("grow roots")
    }
  
    checkRootExists(inPos) {
      for (let rr = 0; rr < this.roots.length; rr++) {
        if (this.roots[rr].x == inPos.x && this.roots[rr].y == inPos.y || inPos.y > height-1) {
          return false;
        } else {
          return true;
        }
      }
    }
  }
  