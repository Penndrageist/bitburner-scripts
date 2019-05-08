//import {GetAllServers} from "nsFunctions.ns";
import {GetAllServers_KnownStatic_Unsorted} from "nsFunctions.ns";
import {GetFlag} from "argFunctions.ns";

export async function main(ns)
{
    ns.disableLog("ALL");
    
    var printData = GetFlag(ns, "--data");
    
	var allServers = GetAllServers_KnownStatic_Unsorted();
	if(ns.getCharacterInformation().tor)
	{
	    allServers.push("darkweb");
	}
    allServers.push("home");
	
	var contractsFound = 0;
	
	for(var i in allServers)
	{
		var server = allServers[i];
		
		var files = ns.ls(server, ".cct");
		
		for(var f in files)
		{
			ns.tprint(`${server} -> ${files[f]} -> ${ns.codingcontract.getContractType(files[f], server)}`);
			if(printData) ns.tprint(`Data: ${ns.codingcontract.getData(files[f], server)}\n`);
			
			contractsFound++;
		}
		
		await ns.sleep(1);
	}
	
	if(contractsFound === 0)
	{
		ns.tprint(`No contracts found.`);
	}
}