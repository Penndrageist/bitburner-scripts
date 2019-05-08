import {GetFlag, GetArg} from "argFunctions.ns";
import * as sActFuncs from "singularityActions.js";

var crimes = 
[
															//   -> Ha,St,Df,Dx,Ag,Ch
	["shoplift", ["--shoplift"]],							// 0 ->  0, 0, 0, 1, 1, 0
	["rob store", ["--robstore", "--rob", "rob"]],			// 1 ->  1, 0, 0, 1, 1, 0
	["mug", ["--mug", "mug"]],								// 2 ->  0, 1, 1, 1, 1, 0
	["larceny", ["--larceny"]],								// 3 ->  1, 0, 0, 1, 1, 0
	["deal drugs", ["--drugs","--dealdrugs"]],				// 4 ->  0, 0, 0, 1, 1, 1
	["bond forgery", ["--bond", "--bondforgery"]],			// 5 ->  0, 0, 0, 0, 0, 0 ??
	["traffick arms", ["--traffick", "--traffickarms"]],	// 6 ->  0, 1, 1, 1, 1, 1
	["homicide", ["--homicide", "homicide", "kill"]],		// 7 ->  0, 1, 1, 1, 1, 0
	["grand theft auto", ["--gta"]],						// 8 ->  0, 1, 1, 1, 1, 1
	["kidnap", ["--kidnap"]],								// 9 ->  0, 1, 1, 1, 1, 1
	["assassinate", ["--assassinate", "--ass"]],			// 10->  0, 1, 1, 1, 1, 0
	["heist", ["--heist"]]									// 11->  1, 1, 1, 1, 1, 1
];

function Crime(ns, name)
{
	this.ns = ns;
	this.name = name;
	
	this.IsDone = function() { this.ns.print(`Crime uninitialised`);}
	
	this.tarHacking = 0;
	this.tarStr = 0;
	this.tarDef = 0;
	this.tarDex = 0;
	this.tarChar = 0;
	
	this.currentCount = 0;
	this.countMax = 0;
}

Crime.prototype.Init = function(mode)
{
	switch(mode)
	{
		case "endless":
			this.IsDone = this.IsDoneEndless;
			break;
		case "stats":
			this.IsDone = this.IsDoneStats;
			break;
		case "count":
			this.IsDone = this.IsDoneCount;
			break;
	}
}

Crime.prototype.Commit = function ()
{
    //this.ns.print(`Chance for crime: ${this.ns.nFormat(this.ns.getCrimeChance(this.name), "0.00%")}`);
	sActFuncs.commitCrime(this.ns, this.name);
}

Crime.prototype.IsDoneEndless = function()
{
	return false;
}

Crime.prototype.IsDoneStats = function()
{
	var cStats = this.ns.getStats();
	
	return cStats.hacking >= this.tarHacking &&
		   cStats.strength >= this.tarStr &&
		   cStats.defense >= this.tarDef &&
		   cStats.dexterity >= this.tarDex &&
		   cStats.agility >= this.tarAgi &&
		   cStats.charisma >= this.tarChar;
}

Crime.prototype.IsDoneCount = function()
{
	this.ns.print(`Remaining crimes: ~${this.countMax - this.currentCount}`);
	return this.currentCount++ > this.countMax;
}

let DEF_SLEEP_TIME = 30000;
	
export async function main(ns)
{
    ns.disableLog("sleep");
	var sleepTime = GetArg(ns, "-s", DEF_SLEEP_TIME);
	
	var crimeArg = GetArg(ns, "-c", null);
	
	if(crimeArg === null) return;
	
	// find the crime from the list
	var foundCrime = null;
	for(var c = 0; c < crimes.length && foundCrime === null; c++)
	{
		var crime = crimes[c];
		var crimeFlags = crime[1];
		
		for(var cf = 0; cf < crimeFlags.length; cf++)
		{
			if(GetFlag(ns, crimeFlags[cf]))
			{
				foundCrime = crime[0];
				break;
			}
		}
	}
	
	if(foundCrime === null) exit;
	
	var mode = GetArg(ns, "--mode", "endless");
	var committingCrime = new Crime(ns, foundCrime);
	
	committingCrime.Init(mode);
	
	switch(mode)
	{
		case "stats":
			var baseAll = GetArg(ns, "--all", 100);
			committingCrime.tarHacking = GetArg(ns, "-hack", 0);
			committingCrime.tarStr = GetArg(ns, "-str", baseAll);
			committingCrime.tarDef = GetArg(ns, "-def", baseAll);
			committingCrime.tarDex = GetArg(ns, "-dex", baseAll);
			committingCrime.tarAgi = GetArg(ns, "-agi", baseAll);
			committingCrime.tarChar = GetArg(ns, "-char", 0);
			ns.tprint(`Committing crimes until -> STR[${committingCrime.tarStr}] DEF[${committingCrime.tarDef}] DEX[${committingCrime.tarDex}] AGI[${committingCrime.tarAgi}]`);
			break;
		case "count":
			committingCrime.countMax = GetArg(ns, "-count", GetArg(ns, "--count", 1));
			ns.tprint(`Committing crimes [${committingCrime.countMax}] times.`);
			break;
	}
	
	await ns.sleep(DEF_SLEEP_TIME);
	
	do
	{
		while(sActFuncs.currentAction(ns).type == sActFuncs.crimeAction()) 
		{
		    await ns.sleep(sleepTime);
		}
		
		var crimeTime = committingCrime.Commit();
	}
	while (!committingCrime.IsDone());
}