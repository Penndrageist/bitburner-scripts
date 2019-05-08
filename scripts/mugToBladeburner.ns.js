import {GetFlag} from "argFunctions.ns";
import {GetArg} from "argFunctions.ns";

var crimes = 
[
	["mug", ["--mug"]],
];
	
export async function main(ns)
{
	var sleepTime = GetArg(ns, "-s", 30000);
	var foundCrime = crimes[0][0];
	
	ns.tprint("Commit crime: " + foundCrime);
	
	await ns.sleep(sleepTime);
	
	var done = false;
	while(!done)
	{
		while(ns.isBusy()) 
		{
		    await ns.sleep(sleepTime);
		}
		
		var crimeTime = ns.commitCrime(foundCrime);
		
		await ns.sleep(sleepTime);
		
		var cInfo = ns.getStats();
		
		if(cInfo.strength >= 100 &&
		    cInfo.defense >= 100 &&
		    cInfo.dexterity >= 100 &&
		    cInfo.agility >= 100)
	    {
	        done = true;
	    }
	}
}