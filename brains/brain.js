var drawBrain = false;
class ABrain {
	constructor(brainGenes) {
		this.geneSet = brainGenes;
		this.GSequence = hex2bin(brainGenes); // converts to binary
		
		this.source_type = int(this.GSequence[0]); // choose input sensory or internal neuron source
		
		this.source_ID = this.GSequence.substring(1, 8); // specific neuron source id in binary
		this.source_ID = parseInt(this.source_ID, 2); // convert back to number
		
		this.sink_type = int(this.GSequence[8]); // trigger an internal neuron or an output action neuron
		
		this.sink_id = this.GSequence.substring(9, 16); // specific neuron source id in binary
		this.sink_id = parseInt(this.sink_id, 2); // convert back to number
		
		this.connection_weight = this.GSequence.substring(16, 32);
		this.connection_weight = parseInt(this.connection_weight, 2); // convert back to number
		this.connection_weight /= 10000;
		
		
		this.senses = [
			this.Sens_RootMoistureLocal,
			this.Sens_RootMoistureDir,
			this.Sens_Random,
			this.Sens_Osc,
			this.Sens_Energy,
			this.Sens_MoveDirection
		];
		
		// this.Sens_Bl,
		// this.Sens_Br,
		// this.Sens_BLfd,
		// this.Sens_BLlr,
		
		this.source_ID = this.source_ID % this.senses.length;
		
		this.actions = [
			this.Act_OSC,
			this.Act_GRoot,
			this.Act_SRoot
		];
		
		
		this.sink_id = this.sink_id % this.actions.length;
		
		// console.log("GSequence: " + this.GSequence);
		// console.log("source_type: " + this.source_type);
		// console.log("source_ID: " + this.source_ID);
		// console.log("sink_type: " + this.sink_type);
		// console.log("sink_id: " + this.sink_id);
		// console.log("connection_weight: " + this.connection_weight);
		// console.log("____")
	}
	
	RunSynapse(agentObj) {
		let sensVal = 0;
		if (this.source_type == 1) {
			// is an external sense
			sensVal = this.senses[this.source_ID](agentObj);
		} else {
			// is an internal neuron value
			sensVal = agentObj.InternalNeurons[this.source_ID % 3]; // sets the sense as from an internal neuron
			// console.log("internal input");
		}
		
		sensVal *= this.connection_weight;
		// console.log("sensValue : " + sensVal);
		
		if (this.sink_type == 1) {
			// is an external action
			this.actions[this.sink_id](sensVal, agentObj);
		} else {
			// sink to internal neuron value
			let cval = agentObj.InternalNeurons[this.source_ID % 3];
			agentObj.InternalNeurons[this.source_ID % 3] = Math.tanh(
				(cval + sensVal) / 2 //does a tanh function for some reason idk why
				);
				// console.log(
				//   "internal neuron : " + agentObj.InternalNeurons[this.source_ID % 3]
				// );
			}
			// console.log("+++");
			// this.actions[this.sink_id](sensVal);
		}
		
		Sens_MoveDirection(agentObj){
			
			return map(agentObj.growDirection, -3.1415, 3.1415, -1,1);
		}
		
		Sens_RootMoistureLocal(agentObj){
			
			let rootPicVec = grids.moisture.indexToVector(agentObj.roots[agentObj.rootPick])
			// console.log(rootPicVec)
			let foundMoisture = grids.moisture.computeLocalMoisture(rootPicVec.x, rootPicVec.y).totalLocalMoisture;
			// console.log(foundMoisture)
			console.log("Sens_local moisture : " + foundMoisture)
			return map(foundMoisture, 0,10, -1,1)
		}
		
		Sens_RootMoistureDir(agentObj){
			
			let rootPicVec = grids.moisture.indexToVector(agentObj.roots[agentObj.rootPick])
			// console.log(rootPicVec)
			let foundMoisture = grids.moisture.computeLocalMoisture(rootPicVec.x, rootPicVec.y).highestLocalMoistureDirection;
			// console.log(foundMoisture.heading())
			console.log("Sens_local moisture : " + foundMoisture.heading())
			return map(foundMoisture.heading(), -3.1415, 3.1415, -1,1);
		}
		
		Sens_Age(agentObj) {
			// console.log("SENS : age");
			return map(agentObj.age, 0, maxCycles, 0, 1);
			// age
		}
		Sens_Random(agentObj) {
			// console.log("SENS : random");
			//
			return random(-1, 1);
		}
		
		Sens_BLlr(agentObj){
			//     /// sens blocked long left right
			//     noStroke()
			//     fill(0,0,200)
			
			//     let blockedL = checkPixeltoWall(agentObj.farLeft)
			
			//     // let gridPosL = [int((agentObj.farLeft.x/width)*100),int((agentObj.farLeft.y/height)*100)]
			//     // let blockedL = worldGrid[gridPosL[0]][gridPosL[1]]
			
			//     if(agentObj.farLeft.x<0 || agentObj.farLeft.x>width){
			//         blockedL = true
			
			//     }
			//     let blockedR = checkPixeltoWall(agentObj.farRight)
			//     if(agentObj.farRight.x<0 || agentObj.farRight.x>width){
			//         blockedR = true
			//     }
			
			//     let outVal = 0;
			//     if(blockedR == true && blockedL == false){
			//         outVal = -1
			//         if(drawBrain){
			//             rect(agentObj.farRight.x, agentObj.farRight.y, 2, 2)
			//             stroke(0,50)
			//             noFill()
			//             line(agentObj.loc.x, agentObj.loc.y, agentObj.farRight.x, agentObj.farRight.y)
			//         }
			
			
			//     }else if(blockedR == false && blockedL == true){
			//         outVal = 1
			//         if(drawBrain){
			//             rect(agentObj.farLeft.x, agentObj.farLeft.y, 2, 2)
			//             stroke(0,50)
			//             noFill()
			//             line(agentObj.loc.x, agentObj.loc.y, agentObj.farLeft.x, agentObj.farLeft.y)
			//         }
			//     }
			//     return(outVal)
			
			
			
		}
		
		Sens_Bl(agentObj) {
			// // console.log("SENS : blocked left");
			
			// // let gridPosL = [int((agentObj.Lloc.x/width)*100),int((agentObj.Lloc.y/height)*100)]
			// // let blockedL = worldGrid[gridPosL[0]][gridPosL[1]]
			
			// let blockedL = checkPixeltoWall(agentObj.Lloc)
			
			// if(agentObj.Lloc.x<0 || agentObj.Lloc.x>width){
			//     blockedL = true
			// }
			
			// if(blockedL){
			//     return 1
			// }else{
			//     return 0
			// }
			
		}
		
		Sens_Br(agentObj) {
			// let gridPosR = [int((agentObj.Rloc.x/width)*100),int((agentObj.Rloc.y/height)*100)]
			// let blockedR = worldGrid[gridPosR[0]][gridPosR[1]]
			
			// let blockedR = checkPixeltoWall(agentObj.Rloc)
			
			
			
			
			// if(agentObj.Rloc.x<0 || agentObj.Rloc.x>width){
			//     blockedR = true
			// }
			
			// if(blockedR){
			//     return 1
			// }else{
			//     return 0
			// }
			
		}
		
		Sens_BLfd(agentObj){
			// console.log(agentObj.farForward)
			
			//  // far forward looking
			//  let gx  = int((agentObj.farForward.x/width)*100);
			//  gx = constrain(gx ,0, worldGrid.length-1) 
			//  let gy = int((agentObj.farForward.y/height)*100)
			//  gy = constrain(gy ,0, worldGrid.length-1) 
			
			//  let gridPos = [gx,gy]
			
			
			//  let blockedFwrd = false;
			
			//  try{
			//    blockedFwrd = worldGrid[gridPos[0]][gridPos[1]]
			
			//  }catch{
			//   console.log('bad loc')
			//   console.log(gridPos)
			//   console.log(worldGrid[gridPos[0]])
			//   console.log(worldGrid[gridPos[0]][gridPos[1]])
			// }
			//--------------------------------------
			// let blockedFwrd = checkPixeltoWall(agentObj.farForward)
			
			// // let pxlFwrd = GetPixel(agentObj.floc.x, agentObj.floc.y, wallLayer)[0];
			
			// if (blockedFwrd==true) {
			
			
			//     if(drawBrain){
			//         fill(200,0,0)
			//         noStroke()
			//         rect(agentObj.farForward.x, agentObj.farForward.y, 2, 2) // far forward loc
			//         stroke(0,50)
			//         noFill()
			//         line(agentObj.loc.x, agentObj.loc.y, agentObj.farForward.x, agentObj.farForward.y)
			
			//     }
			
			
			//     return 1
			// }
			// return 0;
			
		}
		
		Sens_Bfd(agentObj) {
			// console.log("SENS : blocked forward");
			
			// let gridPos = [int((agentObj.floc.x/width)*100),int((agentObj.floc.y/height)*100)]
			
			// let gx  = int((agentObj.floc.x/width)*100);
			// gx = constrain(gx ,0, worldGrid.length) 
			// let gy = int((agentObj.floc.y/height)*100)
			// gy = constrain(gy ,0, worldGrid.length) 
			
			// let gridPos = [gx,gy]
			
			
			// // let pxlFwrd = GetPixel(agentObj.floc.x, agentObj.floc.y, wallLayer)[0];
			// let blockedFwrd = worldGrid[gridPos[0]][gridPos[1]]
			
			// let blockedFwrd = checkPixeltoWall(agentObj.floc)
			
			
			
			// if( agentObj.floc.x < 0 || agentObj.floc.x > width){
			//     blockedFwrd = true
			// }
			
			// if( agentObj.floc.y < 0 || agentObj.floc.y > height){
			//     blockedFwrd = true
			// }
			
			// if (blockedFwrd==true) {
			//     return 1
			// }
			// return 0;
			// blockage forward
		}
		
		Sens_Energy(agentObj){
			return map( agentObj.energy, 0,100, 0, 1);
		}
		
		Sens_Osc(agentObj) {
			// console.log("SENS : osculator");
			// oscillator
			agentObj.internalClock += agentObj.clockSpeed;
			return sin(this.internalClock);
		}
		
		Sens_LMy(agentObj) {
			// console.log("SENS : last y movement");
			//last movement y
		}
		
		// Sens_LBf(agentObj) {
		//     // console.log("SENS : last x movement");
		//     //last movement x
		// }
		
		Sens_DCtr(agentObj){
			// distance from end
			let distN = dist(agentObj.loc.x, agentObj.loc.y, endzone[0], endzone[1] );
			return map(distN, 0, width, 0, 1);
			
		}
		Act_OSC(trigger, agentObj) {
			// console.log("ACT : set osculator");
			// set osculator
			agentObj.clockSpeed = trigger;
		}
		Act_Res(trigger, agentObj) {
			// console.log("ACT : set responsiveness");
			//set responsiveness
			agentObj.responsiveness = abs(trigger);
		}
		Act_SSpread(trigger, agentObj){
			//set spread ammount
			
		}
		
		Act_SetRootRange(target, agentObj){
			// set root range
			gentObj.rootRange = int(map(trigger, -1,1,agentObj.roots.length))
		}
		
		Act_SRoot(trigger, agentObj){
			// console.log(trigger)
			let maxRootIdx = agentObj.roots.length
			let minRootIdx = maxRootIdx - agentObj.rootRange
			agentObj.rootPick = int(map(trigger, -1,1,minRootIdx,maxRootIdx)) // sets the root to look at. 
			console.log("set root pick to " + agentObj.rootPick);
		}
		
		Act_SetGrowAmmt(trigger, agentObj){
			agentObj.growDistance = int(map(trigger, -1,1, agentObj.minGrowDistance,agentObj.maxGrowDistance)) // sets the root to look at. 
		}
		
		Act_GRoot(trigger, agentObj){
			if(trigger>.5){
				agentObj.attemptToGrow();
			}
		}
		
		
		
	}
	