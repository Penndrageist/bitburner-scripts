import {GetFlag, GetArg, GetIndex} from "argFunctions.ns";
import * as sActFuncs from "singularityActions.js";

let augmentsToIgnore = 
[
    "NeuroFlux Governor"
];

let unlockedAugments = [];

function Faction(ns, name, factionWorkPreference)
{
	this.ns = ns;
	this.factionName = name;
	this.factionWorkPreference = factionWorkPreference;
	
	this.currentRep = this.ns.getFactionRep(this.factionName);
	this.maxRepRequired = -1;
	this.desiredAugments = [];
}

const gangFactions = [
    "Slum Snakes",
    "Tetrads",
    "The Syndicate",
    "The Dark Army",
    "Speakers for the Dead",
    "NiteSec",
    "The Black Hand"
];

Faction.prototype.WantToWork = function()
{
    if(this.factionName == "Bladeburners") return false;
    //if(this.factionName == "Slum Snakes") return false;
    if(gangFactions.includes(this.factionName)) return false;
    
	this.currentRep = this.ns.getFactionRep(this.factionName);
	
	return this.currentRep < this.maxRepRequired;
};

Faction.prototype.ProcessUnlocked = function()
{
	let charInfo = this.ns.getCharacterInformation();
	
	var factionAugs = this.ns.getAugmentationsFromFaction(this.factionName);
	this.currentRep = this.ns.getFactionRep(this.factionName);
	
	for(var fa = 0; fa < factionAugs.length; fa++)
	{
		var augment = factionAugs[fa];
		
		if(unlockedAugments.includes(augment))
		{
			continue;
		}
		
		if(this.ns.getAugmentationCost(augment)[0] <= this.currentRep)
		{
			unlockedAugments.push(augment);
		}
	}
};

Faction.prototype.ProcessDesired = function()
{
    if(this.maxRepRequired > 0) return;
    
	var ownedAugments = this.ns.getOwnedAugmentations(true);
	
	var cFac = this.factionName;
	
	var factionAugments = this.ns.getAugmentationsFromFaction(cFac);
	
	var maxRep = 0;
	var desiredAugs = [];
	
	for(var a = 0; a < factionAugments.length; a++)
	{
		var aug = factionAugments[a];
		
		// skip owned augments
		if(ownedAugments.includes(aug))
		{
			//ns.print("Skipping " + aug + ". Owned already.");
			continue;
		}
			
		// skip ignored augments
		if(augmentsToIgnore.includes(aug))
		{
			//ns.print("Skipping " + aug + ". To be ignored.");
			continue;
		}
		
		// skip owned augments
		if(unlockedAugments.includes(aug))
		{
			//ns.print("Skipping " + aug + ". Unlocked already.");
			continue;
		}
			
		var costs = this.ns.getAugmentationCost(aug);
		
		//ns.print(aug + " will need " + costs[0] + " reputation.");
			
		// costs[0] is rep
		if(costs[0] > maxRep)
		{
			// on the front
			desiredAugs.unshift(aug);
			maxRep = costs[0];
		}
		else
		{
			// on the end
			desiredAugs.push(aug);
		}
		
		// costs[1] is money
		// unimportant for the moment
	}
	
	if(desiredAugs.length > 0)
	{
		this.ns.print(`${cFac} processed. Max Rep Required: ${maxRep}. Current ${this.ns.getFactionRep(cFac)}`);
		
		this.maxRepRequired = maxRep;
		this.desiredAugments.push(desiredAugs);
	}
};

Faction.prototype.Work = function()
{
	var working = false;
	for(var w = 0; w < this.factionWorkPreference.length && !working; w++)
	{
        this.ns.print(`Attempting to work ${this.factionWorkPreference[w]} for ${this.factionName}`);
		working = sActFuncs.workForFaction(this.ns, this.factionName, this.factionWorkPreference[w]);
	}
	
	return working;
};

export async function main(ns)
{
	ns.disableLog("ALL");
	
	let WORK_COMPANIES = "nsWorkCompanies.ns";
	
	var sleepAmount = GetArg(ns, "-s");
	if(sleepAmount === null) sleepAmount = 60000;
	
	var overrideFaction = GetArg(ns, "--override", null);
	
	let factionWorkPreference = [];
	
	var indicies = [
		{ action: "hacking", index:  GetIndex(ns, "--hack") },
		{ action: "field", index:  GetIndex(ns, "--field") },
		{ action: "security", index:  GetIndex(ns, "--sec") }
	];
	
	for(var i = 0; i < indicies.length; i++)
    {
        if(indicies[i].index == -1)
        {
            indicies[i].index = Math.random() * indicies.length + 1;
        }
    }
	
	indicies.sort((a,b) => {
	    if(a.index == b.index) 
	    { 
	        return Math.random() * 2 - 1;
        }
        else
        { 
            return a.index - b.index;
        } 
	});
	
	for(var i = 0; i < indicies.length; i++)
    {
        factionWorkPreference.push(indicies[i].action);
    }

	let factionDict = {};
	
    await ns.sleep(sleepAmount * 0.5);

    var faction = null;
	while(true)
	{
		var charInfo = ns.getCharacterInformation();
	    var currentFactions = charInfo.factions;
	    
	    for(var f = 0; f < currentFactions.length; f++)
	    {
			faction = factionDict[currentFactions[f]];
			
			if(faction === null || faction === undefined)
			{
				faction = new Faction(ns, currentFactions[f], factionWorkPreference);
				factionDict[currentFactions[f]] = faction;
			}
		    
		    faction.ProcessUnlocked();
		}
	        
	    for(var key in factionDict)
	    {
			faction = factionDict[key];
			
			if(faction === null || faction === undefined)
			{
				continue;
			}
		
			faction.ProcessDesired();
		}
		
	    var factionToWorkFor = null;
	    var factionIndex = -1;
	    
		for(var k in factionDict)
	    {
			faction = factionDict[k];
			
			if(faction.WantToWork())
			{
				if(overrideFaction !== null && overrideFaction == faction.factionName)
				{
					factionToWorkFor = faction;
					break;
				}
				else if(factionToWorkFor === null)
				{
					factionToWorkFor = faction;
					if(overrideFaction === null) break;
				}
				
			}
		}
		
    	if(factionToWorkFor === null)
    	{
    	    ns.print(`Nothing to do. Sleeping for ${sleepAmount}ms`);
			
			// no faction to work for, so run companies script
			if(!ns.scriptRunning(WORK_COMPANIES, "home")) await ns.run(WORK_COMPANIES);
			
            await ns.sleep(sleepAmount);
            continue;
    	}
		else
		{
			// there is a faction, so if nsWorkCompanies.ns is running, kill it
			if(ns.scriptRunning(WORK_COMPANIES, "home"))
			{
				//await ns.scriptKill(WORK_COMPANIES, "home");
				
				if(sActFuncs.currentAction(ns).type == sActFuncs.companyAction())
				{
					ns.stopAction();
				}
			}
		}
    	
	    while(ns.isBusy()) 
	    {
	        await ns.sleep(sleepAmount);
	    }
	    
    	var isWorking = false;
		
    	while(true)
	    {
		    isWorking = factionToWorkFor.Work();
	        
	        if(ns.isBusy())
    		{
    		    charInfo = ns.getCharacterInformation();
    		    
    		    var currentEffectiveRep = ns.getFactionRep(factionToWorkFor.factionName);
    		    currentEffectiveRep += charInfo.workRepGain;
    		    
    		    ns.print(`${factionToWorkFor.factionName}: C[${currentEffectiveRep}] <::> T[${factionToWorkFor.maxRepRequired}]`);
    		    
    		    if(currentEffectiveRep >= factionToWorkFor.maxRepRequired)
    		    {
    		        ns.stopAction();
    		        break;
    		    }
    		    else
    		    {
    		        await ns.sleep(sleepAmount);
    		    }
    		}
    		else
    		{
		        await ns.sleep(sleepAmount);
    		    isWorking = false;
    		}
    		
			// work for the first faction that has stuff that I want
    		if(ns.getFactionRep(factionToWorkFor.factionName) >= factionToWorkFor.maxRepRequired)
    		{
    			break;
    		}
    		
    		await ns.sleep(1);
	    }
	    
        await ns.sleep(sleepAmount * 0.5);
	}
}