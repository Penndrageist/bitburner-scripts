import {GetFlag} from "argFunctions.ns";

function sellAllStocks(ns)
{
	var stockSyms = ns.getStockSymbols();
	
	for(var i = 0; i < stockSyms.length; i++)
	{
		var sym = stockSyms[i];
		var stockPos = ns.getStockPosition(sym);
		
		var longShares = stockPos[0];
		if(longShares > 0) 
		{
		    ns.sellStock(sym, longShares);
		    ns.tprint(`Sold ${longShares} Long shares of ${sym}`);
		}
		
		var shortShares = stockPos[2];
		if(shortShares > 0)
		{
		    ns.sellShort(sym, shortShares);
		    ns.tprint(`Sold ${shortShares} Short shares of ${sym}`);
		}
	}	
}

async function buyAugmentations(ns)
{
	var charInfo = ns.getCharacterInformation();
	var factions = charInfo.factions;
	
	if(factions.length === 0) return;
	
	var maxFaction = factions[0];
	var maxRep = ns.getFactionRep(maxFaction);
	
	for(var i = 1; i < factions.length; i++)
	{
		var fac = factions[i];
		var facRep = ns.getFactionRep(fac);
		
		if(facRep > maxRep)
		{
			maxRep = facRep;
			maxFaction = fac;
		}
	}
	
	while(ns.purchaseAugmentation(maxFaction, "NeuroFlux Governor"))
	{
		await ns.sleep(1);
	}
}

export async function main(ns)
{
    var onlySellStocks = GetFlag(ns, "-ss");
    
	let CLEAR_SERVERS = "clearServers.js";
	
	ns.scriptKill("stock-master.ns", "home");
	ns.scriptKill("nsWorkFactions.ns", "home");
	ns.scriptKill("nsWorkCompanies.ns", "home");

    /*	
	await ns.run(CLEAR_SERVERS, 1);

	await ns.sleep(1000);

	while(ns.getPurchasedServers().length > 0) 
	{
		await ns.sleep(1);
	}
	*/
    
	ns.scriptKill("serverOps.js", "home");
	
	await ns.sleep(6100);

	// sell all stocks
	sellAllStocks(ns);
	
	if(onlySellStocks) 
	{
        ns.tprint(`Sold stocks. Ending.`);
	    return;
	}
    
    let purchaseAugsScript = "purchaseAugmentations.js";
    ns.run(purchaseAugsScript, 1);
    
    await ns.sleep(1000);
    
    while(ns.scriptRunning(purchaseAugsScript, "home"))
    {
        await ns.sleep(1);
    }
	
	// buy NeuroFlux Governor until not enough money remaining
	await buyAugmentations(ns);
	
	// install them and re-run self
	ns.installAugmentations("nsSingularity.js");
}