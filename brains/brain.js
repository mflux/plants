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
			this.Sens_MoveDirection,
			this.Sens_GrowthPotential,
			this.Sens_Age
		];
		
		this.source_ID = this.source_ID % this.senses.length;
		
		this.actions = [
			this.Act_OSC,
			this.Act_GRoot,
			this.Act_SRoot,
			this.Act_SSpread,
			this.Act_SetRootRange
		];
		
		this.sink_id = this.sink_id % this.actions.length;
		
		if(debugBrain){
			console.log("GSequence: " + this.GSequence);
			console.log("source_type: " + this.source_type);
			console.log("source_ID: " + this.source_ID);
			console.log("sink_type: " + this.sink_type);
			console.log("sink_id: " + this.sink_id);
			console.log("connection_weight: " + this.connection_weight);
			console.log("____")
		}
	}
	
	RunSynapse(agentObj) {

		if(debugBrain)console.log("---- Start Synapse ----");

		let sensVal = 0;
		if (this.source_type == 1) {
			// is an external sense
			sensVal = this.senses[this.source_ID](agentObj);
		} else {
			// is an internal neuron value
			sensVal = agentObj.InternalNeurons[this.source_ID % agentObj.InternalNeurons.length]; // sets the sense as from an internal neuron
			if(debugBrain)console.log("sens internal neuron : " + agentObj.InternalNeurons[this.source_ID % agentObj.InternalNeurons.length]);
		}
		
		sensVal *= this.connection_weight; // the connection weight is part of the genome, it will decide how strong to make the connection, can become negative
		if(debugBrain)console.log("connection trigger : " + sensVal);
		
		if (this.sink_type == 1) {
			// is an external action
			this.actions[this.sink_id](sensVal, agentObj);
		} else {
			// sink to internal neuron value
			let cval = agentObj.InternalNeurons[this.source_ID % agentObj.InternalNeurons.length];  // current value in the internal neuron
			let setTo = Math.tanh( (cval + sensVal) );//does a tanh function for some reason idk why
			if(isNaN(setTo)){
				setTo = 0;
			}
			agentObj.InternalNeurons[this.source_ID % agentObj.InternalNeurons.length] = setTo;
			
			if(debugBrain)console.log("set internal neuron : " + setTo);
			}
			
			if(debugBrain)console.log("---- END Synapse ----");
		}
		

		//  #####  ####### #     #  #####  #######  #####  
		// #     # #       ##    # #     # #       #     # 
		// #       #       # #   # #       #       #       
		//  #####  #####   #  #  #  #####  #####    #####  
		//  	 # #       #   # #       # #             # 
		// #     # #       #    ## #     # #       #     # 
		//  #####  ####### #     #  #####  #######  #####  
														

		Sens_GrowthPotential(agentObj){
			let sensAmmt = computeNormalizedGrowthPotential(agentObj.rootPick, agentObj.earthGrid, agentObj.plantMatterGrid)
			if(debugBrain)console.log('sens growth Potential : '+ sensAmmt)
			return sensAmmt 
			}

		Sens_MoveDirection(agentObj){
			let moveDir = map(agentObj.growDirection, -3.1415, 3.1415, -1,1);
			if(debugBrain)console.log('sens move direction  : '+ moveDir)
			return moveDir
		}
		
		Sens_RootMoistureLocal(agentObj){
			let rootPicVec = grids.moisture.indexToVector(agentObj.roots[agentObj.rootPick])
			let foundMoisture = grids.moisture.computeLocalMoisture(rootPicVec.x, rootPicVec.y).totalLocalMoisture;
			if(debugBrain)console.log("Sens_local moisture : " + foundMoisture)
			return map(foundMoisture, 0,10, -1,1)
		}
		
		Sens_RootMoistureDir(agentObj){
			
			let rootPicVec = grids.moisture.indexToVector(agentObj.roots[agentObj.rootPick])
			let foundMoisture = grids.moisture.computeLocalMoisture(rootPicVec.x, rootPicVec.y).highestLocalMoistureDirection;
			let foundHeading = map(foundMoisture.heading(), -3.1415, 3.1415, -1,1);
			if(debugBrain)console.log("Sens moisture direction : " + foundHeading)
			return foundHeading
		}
		
		Sens_Age(agentObj) {
			let ageN = map(agentObj.age, 0, maxCycles, 0, 1);
			if(debugBrain)console.log("sens age now : " + ageN);
			return ageN
		}
		Sens_Random(agentObj) {
			let randN = random(-1, 1)
			if(debugBrain)console.log("sens random : " + randN );
			return randN
		}
	
		Sens_Energy(agentObj){
			let energyN = map( agentObj.energy, 0,100, 0, 1);
			if(debugBrain)console.log("sens energy now : " + energyN );
			return energyN
		}
		
		Sens_Osc(agentObj) {			// oscillator
			agentObj.internalClock += agentObj.clockSpeed;
			let newClock = sin(agentObj.internalClock);

			if(debugBrain)console.log("sens Internal Clock : " + newClock );
			return newClock
		}


		// ACTIONS
//     #     #####  ####### ### ####### #     #  #####  
//    # #   #     #    #     #  #     # ##    # #     # 
//   #   #  #          #     #  #     # # #   # #       
//  #     # #          #     #  #     # #  #  #  #####  
//  ####### #          #     #  #     # #   # #       # 
//  #     # #     #    #     #  #     # #    ## #     # 
//  #     #  #####     #    ### ####### #     #  #####  
													 
				
		Act_OSC(trigger, agentObj) {
			if(debugBrain)console.log("Set Clock Speed :  " +  trigger );
			agentObj.clockSpeed = trigger;
		}
		Act_Res(trigger, agentObj) {
			if(debugBrain)console.log("Set responsiveness :  " +  abs(trigger) );
			agentObj.responsiveness = abs(trigger);
		}

		Act_SSpread(trigger, agentObj){
			agentObj.spreadAngle+= trigger
			if(debugBrain)console.log("Set spread to  :  " +  agentObj.spreadAngle );
		}
		Act_SetRootRange(trigger, agentObj){
			// set root range
			agentObj.rootRange = int(map(trigger, -1,1,agentObj.roots.length))
			if(debugBrain)console.log("Set range to  :  " + agentObj.rootRange)
		}
		
		Act_SRoot(trigger, agentObj){
			// console.log("SetRoot Trigger " + trigger)
			if(isNaN(trigger)){
				// console.log("ESCAPE")
				return
			}
			let maxRootIdx = agentObj.roots.length
			let minRootIdx = maxRootIdx - agentObj.rootRange
			let pickID = int(abs(map(trigger, -1,1,minRootIdx,maxRootIdx))) // sets the root to look at. 
			agentObj.rootPick = pickID;
			if(debugBrain)console.log("Set root to  :  " + agentObj.rootPick)
		}
		
		// Act_SetGrowAmmt(trigger, agentObj){
		// 	agentObj.growDistance = int(map(trigger, -1,1, agentObj.minGrowDistance,agentObj.maxGrowDistance)) // sets the root grow distance
		// 	if(debugBrain)console.log("Set root grow distance  :  " + agentObj.growDistance)
		// }
		
		Act_GRoot(trigger, agentObj){
			if(trigger>.5){
				if(debugBrain)console.log("Action Grow Root  :  ")
				agentObj.attemptToGrow();
				
			}
		}
	}
	
	

