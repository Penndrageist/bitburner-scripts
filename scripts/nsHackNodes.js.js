import {GetArg, GetFlag} from "argFunctions.ns";

let MAX_LEVEL = 200;
let MAX_RAM = 64;
let MAX_CORES = 16;

export async function main(ns)
{
	let maxValues = GetFlag(ns, "--max");
	
	let tNodes = GetArg(ns, "--nodes", 0);
	let tLevel = Math.min(GetArg(ns, "--level", maxValues ? MAX_LEVEL : -1), MAX_LEVEL);
	let tRam = Math.min(GetArg(ns, "--ram", maxValues ? MAX_RAM : -1), MAX_RAM);
	let tCores = Math.min(GetArg(ns, "--cores", maxValues ? MAX_CORES : -1), MAX_CORES);
	
	ns.tprint(`Nodes: ${tNodes}`);
	ns.tprint(`Level: ${tLevel}`);
	ns.tprint(`RAM: ${tRam}`);
	ns.tprint(`Cores: ${tCores}`);
	
	let targetsReached = false;
	
	while(!targetsReached)
	{
		targetsReached = true;
		
		if(ns.hacknet.numNodes() < tNodes)
		{
			ns.hacknet.purchaseNode();
			targetsReached = false;
		}
		
		for(let i = 0; i < ns.hacknet.numNodes(); i++)
		{
			var nodeStats = ns.hacknet.getNodeStats(i);
			
			if(nodeStats.level < tLevel)
			{
				ns.hacknet.upgradeLevel(i, 1);
				targetsReached = false;
				await ns.sleep(1);
			}
			
			if(nodeStats.ram < tRam)
			{
				ns.hacknet.upgradeRam(i, 1);
				targetsReached = false;
				await ns.sleep(1);
			}
			
			if(nodeStats.cores < tCores)
			{
				ns.hacknet.upgradeCore(i, 1);
				targetsReached = false;
				await ns.sleep(1);
			}
			
			await ns.sleep(1);
		}
		
		await ns.sleep(1);
	}
}