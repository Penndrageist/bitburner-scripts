import {GetFlag} from "argFunctions.ns";
import {GetArg} from "argFunctions.ns";

var crimes = 
[
	["shoplift", ["--shoplift"]],
	["rob store", ["--robstore", "--rob"]],
	["mug", ["--mug"]],
	["larceny", ["--larceny"]],
	["deal drugs", ["--drugs","--dealdrugs"]],
	["bond forgery", ["--bond", "--bondforgery"]],
	["traffick arms", ["--traffick", "--traffickarms"]],
	["homicide", ["--homicide"]],
	["grand theft auto", ["--gta"]],
	["kidnap", ["--kidnap"]],
	["assassinate", ["--assassinate", "--ass"]],
	["heist", ["--heist"]]
];
	
export async function main(ns)
{
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
	
	if(foundCrime !== null)
	{
    	var sleepTime = GetArg(ns, "-s");
    	if(sleepTime === null) 
    	{
    	    sleepTime = 30000;
    	}
    	
    	ns.tprint("Commit crime: " + foundCrime);
    	
    	await ns.sleep(30000);
    	
    	while(true)
    	{
    		while(ns.isBusy()) 
    		{
    		    await ns.sleep(sleepTime);
    		}
    		
    		var crimeTime = ns.commitCrime(foundCrime);
    		
    		await ns.sleep(sleepTime);
    	}
	}
}