import {GetFlag} from "argFunctions.ns";

var allProgramPairs = [
	["AutoLink.exe", 25],
	["BruteSSH.exe", 50],
	["ServerProfiler.exe", 75],
	["DeepscanV1.exe", 75],
	["FTPCrack.exe", 100],
	["relaySMTP.exe", 250],
	["DeepscanV2.exe", 400],
	["HTTPWorm.exe", 500],
	["SQLInject.exe", 750]
];

function desiredPrograms(ns)
{
	var list = [];
	
	for(var i = 0; i < allProgramPairs.length; i++)
	{
		var progPair = allProgramPairs[i];
		
		if(ns.fileExists(progPair[0])) continue;
		
		list.push(progPair);
	}
	
	return list;
}

export async function main(ns)
{
    ns.disableLog("sleep");
    
	var makeScripts = !GetFlag(ns, "--buy");
	var buyAll = GetFlag(ns, "--all");

	var sleepTime = 60000;
	
	if(!makeScripts)
	{
		while(!ns.getCharacterInformation().tor)
    	{
    		ns.purchaseTor();
    		await ns.sleep(sleepTime);
    	}
	}
	
	while(true)
	{
		var programs = desiredPrograms(ns);
		
		if(programs.length === 0) break;
		
		var hackingLevel = ns.getStats().hacking;
		
		for(var i = 0; i < programs.length; i++)
		{
			var prog = programs[i];
			
			if(makeScripts)
			{
				if(prog[1] > hackingLevel) continue;
			
				while(ns.isBusy()) await ns.sleep(sleepTime);
				
				ns.createProgram(prog[0]);
			}
			else
			{
				if(prog[1] > hackingLevel && !buyAll) continue;
				
				ns.purchaseProgram(prog[0]);
			}
		}
		
		await ns.sleep(1);
	}
}