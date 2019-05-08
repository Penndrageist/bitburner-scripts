import {GetFlag, GetArg} from "argFunctions.ns";

const FIELD_ANALYSIS_INTERVAL = 20; //Number of minutes between field analysis states
const FIELD_ANALYSIS_DURATION = 5;  //Duration in minutes

function BladeburnerHandler(ns, params) {
    //Netscript environment becomes part of the instance
    this.ns = ns;

    //Netscript bladeburner API becomes part of this instance
    for (var bladeburnerFn in ns.bladeburner) {
        this[bladeburnerFn] = ns.bladeburner[bladeburnerFn];
    }

	
    this.fieldAnalysis = params.doFieldAnalysis ? {
        inProgress:         params.startFieldAnalysis ? true : false,
        cyclesRemaining:    params.startFieldAnalysis ? FIELD_ANALYSIS_DURATION : 0,
        cyclesSince:        params.startFieldAnalysis ? FIELD_ANALYSIS_INTERVAL : 0,
    } : null;
	
	this.randomiseEqual = params.randomiseEqual;
	
	this.contractChance = params.contractChance;
	this.operationsChance = params.operationsChance;
	this.blackOpsChance = params.blackOpsChance;
	
	this.doHealing = params.doHealing;
	
	this.prioritiseStamina = false;
	
	this.skillNames = [
		"Blade's Intuition",
		"Cloak",
		"Short-Circuit",
		"Digital Observer",
		"Tracer",
		"Overclock",
		"Reaper",
		"Evasive System",
		"Datamancer",
		"Cyber's Edge",
		"Hands of Midas",
		"Hyperdrive"
	];
	
	this.cities = [
		"Aevum",
		"Chongqing",
		"Sector-12",
		"New Tokyo",
		"Ishima",
		"Volhaven"
	];
	
	this.generalTasks = 
	{
	    // Training
		training: {type:"general", name:"Training", city: null},
	    // Field Analysis
		field_analysis: {type:"general", name:"Field Analysis", city: null},
	    // Recruitment
		recruitment: {type:"general", name:"Recruitment", city: null},
	    // Diplomacy
		diplomacy: {type:"general", name:"Diplomacy", city: null},
	    // Hyperbolic Regeneration Chamber
		healing: {type:"general", name:"Hyperbolic Regeneration Chamber", city: null}
	}
	
	this.blackOperations = // 21 total
	[
		// name, minimumRank
		["Operation Typhoon",          2500],
		["Operation Zero",             5000],
		["Operation X",                7500],
		["Operation Titan",            10000],
		["Operation Ares",             12500],
		["Operation Archangel",        15000],
		["Operation Juggernaut",       20000],
	    ["Operation Red Dragon",       25000],
		["Operation K",                30000],
		["Operation Deckard",          40000],
		["Operation Tyrell",           50000],
		["Operation Wallace",          75000],
		["Operation Shoulder of Orion",100000],
		["Operation Hyron",            125000],
		["Operation Morpheus",         150000],
		["Operation Ion Storm",        175000],
		["Operation Annihilus",        200000],
		["Operation Ultron",           250000],
		["Operation Centurion",        300000],
		["Operation Vindictus",        350000],
		["Operation Daedalus",         null], // 400000
	];
}

BladeburnerHandler.prototype.getStaminaPercentage = function() {
    var res = this.getStamina();
    return (res[0] / res[1]);
}

BladeburnerHandler.prototype.getHealthPercentage = function()
{
	var charInfo = this.ns.getCharacterInformation();
	return charInfo.hp / charInfo.maxHp;
}

BladeburnerHandler.prototype.hasSimulacrum = function() {
    var augs = this.ns.getOwnedAugmentations();
    return augs.includes("The Blade's Simulacrum");
}

BladeburnerHandler.prototype.handle = function() {
	this.ns.clearLog();
    //If we're doing something else manually (without Simlacrum),
    //it overrides Bladeburner stuff
    if (!this.hasSimulacrum() && this.ns.isBusy())
	{
        this.ns.print("Idling bc player is busy with some other action");
        return 1;
    }
	
	if(this.getCurrentAction().type == "BlackOp") 
	{
	    this.ns.print(`Idling bc (assumed) manually started BlackOp action. Name: ${this.getCurrentAction().name}`);
	    return 2;
	}

	if(this.fieldAnalysis !== null)
	{
		if (this.fieldAnalysis.inProgress) 
		{
			--(this.fieldAnalysis.cyclesRemaining);
			if (this.fieldAnalysis.cyclesRemaining < 0) 
			{
				this.fieldAnalysis.inProgress = false;
				this.fieldAnalysis.cyclesSince = 0;
				return this.handle();
			} 
			else 
			{
				this.startAction("general", "Field Analysis");
				this.ns.print("handler is doing field analyis for " +
							  (this.fieldAnalysis.cyclesRemaining+1) + " more mins");
				return 31; //Field Analysis Time + 1
			}
		} 
		else 
		{
			++(this.fieldAnalysis.cyclesSince);
			if (this.fieldAnalysis.cyclesSince > FIELD_ANALYSIS_INTERVAL) 
			{
				this.fieldAnalysis.inProgress = true;
				this.fieldAnalysis.cyclesRemaining = FIELD_ANALYSIS_DURATION;
				return this.handle();
			}
		}
	}

    this.stopBladeburnerAction();

	this.levelSkills();
	
	var action = this.attemptBlackOp();
	if(action === null)
	{
		action = this.chooseAction();
		this.ns.print("handler chose " + action.name + " " + action.type + " through chooseAction()")
		
		if(action.city !== null)
		{
			this.switchCity(action.city);
		}
		
		if(!this.startAction(action.type, action.name))
		{
			action = this.generalTasks.training;
			this.startAction(action.type, action.name);
		}
	}
	
	var currentRank = this.getRank();
	this.ns.print(`Current Rank: ${this.ns.nFormat(currentRank, "0[,]0.00")}`);
	this.ns.print(`Current action type: ${this.getCurrentAction().type}`);
	
	return (this.getActionTime(action.type, action.name) + 1);
}

BladeburnerHandler.prototype.attemptBlackOp = function() 
{
	var currentRank = this.getRank();
	
	for(var i = 0; i < this.blackOperations.length; i++)
	{
		var blackOpPair = this.blackOperations[i];
		
		if(blackOpPair[1] === null || currentRank < blackOpPair[1]) break;
		
		// attempt blackOp
		var action = {type: "BlackOp", name: blackOpPair[0], city: null};
		
		var actionChance = this.getActionEstimatedSuccessChance(action.type, action.name);
		
		if(actionChance < this.blackOpsChance) continue;
		
		if(this.startAction(action.type, action.name))
		{
			return action;
		}
	}
	
	return null;
}

function sortByName(a,b)
{
	if(a.chance == b.chance)
	{
		return b.nameIndex - a.nameIndex;
	}
	else
	{
		return a.chance - b.chance;
	}
}

function sortRandomised(a,b)
{
	if(a.chance == b.chance)
	{
		return Math.random() * 2 - 1;
	}
	else
	{
		return a.chance - b.chance;
	}
}

BladeburnerHandler.prototype.chooseAction = function() 
{	
	if(this.doHealing && this.getHealthPercentage() < 0.50)
	{
		return this.generalTasks.healing;
	}
	
	if(this.prioritiseStamina)
	{
    	var action = this.checkStamina();
    	if(action !== null)
    	{
    	    return action;
    	}
	}
	
    //Array of all Operations
    var ops = this.getOperationNames();
	var opTuples = [];
	
    var contracts = this.getContractNames();
	var contractTuples = [];
	
	for(var c = 0; c < this.cities.length; c++)
	{
		var cityName = this.cities[c];
		this.switchCity(cityName);
        
        var numSynthCommunities = this.getCityEstimatedCommunities(cityName);
        
        for(var i = 0; i < ops.length; i++)
        {
            var op = ops[i];

            if(numSynthCommunities < 5 && op == "Raid") continue;

            opTuples.push(
                {
                    type: "operation",
                    name: op,
                    nameIndex: i,
                    city: cityName,
                    chance: this.getActionEstimatedSuccessChance("operation", op)
                }
            );
        }
		
		for(var i = 0; i < contracts.length; i++)
		{
			var contract = contracts[i];
			
			contractTuples.push(
				{
					type: "contract",
					name: contract,
					nameIndex: i,
					city: cityName,
					chance: this.getActionEstimatedSuccessChance("contract", contract)
				}
			);
		}
	}
	
	if(this.randomiseEqual)
	    opTuples.sort(sortRandomised);
    else
	    opTuples.sort(sortByName);
	    
    //Loop through until you find one with 99+% success chance
    for (let i = 0; i < opTuples.length; ++i)
	{
        let successChance   = opTuples[i].chance;
        let count           = this.getActionCountRemaining("operation", opTuples[i].name);
		
        if (successChance >= this.operationsChance && count > 10) 
		{
            return {type: "operation", name: opTuples[i].name, city: opTuples[i].city};
        }
    }
    
	if(this.randomiseEqual)
	    contractTuples.sort(sortRandomised);
    else
	    contractTuples.sort(sortByName);
	
    for (let i = 0; i < contractTuples.length; ++i) 
	{
        let successChance   = contractTuples[i].chance;
        let count           = this.getActionCountRemaining("contract", contractTuples[i].name);
		
        if (successChance >= this.contractChance && count > 10) 
		{
            return {type: "contract", name: contractTuples[i].name, city: contractTuples[i].city};
        }
    }
	
	var cityTarget = opTuples[opTuples.length-1].city;
	
	if(!this.prioritiseStamina)
	{
    	var action = this.checkStamina();
    	if(action !== null)
    	{
    	    return action;
    	}
	}

	// train in the highest chance city for operations
    return {
		type: this.generalTasks.training.type,
		name: this.generalTasks.training.name,
		city: cityTarget
	};
}

BladeburnerHandler.prototype.checkStamina = function()
{
    var staminaPerc = this.getStaminaPercentage();
	this.ns.print(`Stamina Percent: ${this.ns.nFormat(staminaPerc,"0.00%")}`);
	if (staminaPerc < 0.55) 
	{
		// do Field Analysis to regain stamina
		return {
			type: this.generalTasks.field_analysis.type,
			name: this.generalTasks.field_analysis.name,
			city: null
		};
	}
	else
	{
	    return null;
	}
}

BladeburnerHandler.prototype.levelSkills = function()
{
	var skillPoints = this.getSkillPoints();
	this.ns.print(`Skill Points: ${skillPoints}`);
	
	for(let i = 0; i < this.skillNames.length && skillPoints > 0; i++)
	{
		var skill = this.skillNames[i];
		var cost = this.getSkillUpgradeCost(skill);
		if(cost == -1) this.ns.print(`ERROR: Skill [${skill}] is invalid.`);
		if(cost <= skillPoints && this.upgradeSkill(skill))
		{
			this.ns.print(`Upgraded ${skill} to level ${this.getSkillLevel(skill)}`);
			skillPoints -= cost;
		}
	}
}

BladeburnerHandler.prototype.process = async function() 
{
    await this.ns.sleep(this.handle() * 1000);
}

export async function main(ns) 
{
    //Check if Bladeburner is available. This'll throw a runtime error if it's not
	while(!ns.bladeburner.joinBladeburnerDivision()) await ns.sleep(1);

	var doField = GetFlag(ns, "-f");
    var startFieldAnalysis = !GetFlag(ns, "-nf");
	
    var handler = new BladeburnerHandler(
		ns, 
		{
			doFieldAnalysis: doField,
			startFieldAnalysis: startFieldAnalysis,
			contractChance: GetArg(ns, "-c", 0.80),
			operationsChance: GetArg(ns, "-o", 0.99),
			blackOpsChance: GetArg(ns, "-bo", 0.50),
			doHealing: GetFlag(ns, "-h"),
			randomiseEqual: GetFlag(ns, "-r"),
			prioritiseStamina: GetFlag(ns, "-stam")
		}
	);

    //ns.tprint(`BlackOps: ${ns.bladeburner.getBlackOpNames()}`);
    //ns.tprint(`Operations: ${ns.bladeburner.getOperationNames()}`);
    //ns.tprint(`Contracts: ${ns.bladeburner.getContractNames()}`);
    //ns.tprint(`General Actions: ${ns.bladeburner.getGeneralActionNames()}`);
	
    while(true)
	{
		if(!ns.getCharacterInformation().factions.includes("Bladeburners"))
		{
			ns.bladeburner.joinBladeburnerFaction();
		}
		
        await handler.process();
    }
}