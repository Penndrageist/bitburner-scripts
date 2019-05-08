const OPTIONS = {
	sellForMoney: "Sell for Money",
	sellForCorporation: "Sell for Corporation Funds",
	reduceMinServerSec: "Reduce Minimum Security",
	increaseMaxServerMoney: "Increase Maximum Money",
	improveStudying: "Improve Studying",
	improveGymTraining: "Improve Gym Training",
	exchangeForCorporationResearch: "Exchange for Corporation Research",
	exchangeForBladeBurnerRank: "Exchange for Bladeburner Rank",
	exchangeForBladeBurnerSP: "Exchange for Bladeburner SP",
	generateCodingContract: "Generate Coding Contract"
};

function Log(ns, lHashes, lHashCap)
{
	ns.clearLog();
	
	ns.print(`Current Hashes: ${ns.nFormat(lHashes, "0.000a")}/${ns.nFormat(lHashCap, "0.000a")}`);
	
	for(var option in OPTIONS)
	{
		ns.print(`${ns.hacknet.hashCost(OPTIONS[option])} :: ${OPTIONS[option]}`);
	}
    
    ns.print("=============================================");
}

export async function main(ns)
{
    ns.disableLog("sleep");
    
    var nodeStats = null;
    var i;
	var numHashes = 0;
	var hashCost = 0;
    
	var preferenceList = [
		OPTIONS.generateCodingContract,
		OPTIONS.sellForCorporation,
		OPTIONS.exchangeForCorporationResearch,
		OPTIONS.exchangeForBladeBurnerRank,
		OPTIONS.exchangeForBladeBurnerSP
	];
    
    if(ns.args.length == 1)
    {
        preferenceList = [OPTIONS[ns.args[0]]];
    }
	
	var hashes = 0;
    var hashCapacity = 0;
    
    while(true)
    {
        hashCapacity = 0;
		for(i = 0; i < ns.hacknet.numNodes(); i++)
        {
            // Cache capacity = 1 << (5 + hackServerLevel)
            hashCapacity += 1 << (5 + ns.hacknet.getNodeStats(i).cache);
        }
		
		hashes = ns.hacknet.numHashes();
		
		Log(ns, hashes, hashCapacity);
		
		for(i = 0; i < preferenceList.length; i++)
		{
			hashCost = ns.hacknet.hashCost(preferenceList[i]);
			if(ns.hacknet.spendHashes(preferenceList[i]))
			{
				ns.print(`Spent ${hashCost} on ${preferenceList[i]}`);
				break;
			}
		}
		
		hashes = ns.hacknet.numHashes();
        
		if(hashes >= hashCapacity)
		{
			ns.print(`Spending hashes for money because everything else interesting is too expensive.`);
				
			var sellingForMoney = OPTIONS.sellForMoney;
			var numToSpend = Math.floor(hashes * 0.5 / ns.hacknet.hashCost(sellingForMoney));
			var count = 0;
			for(i = 0; i < numToSpend; i++)
			{
				if(!ns.hacknet.spendHashes(sellingForMoney))
				{
					break;
				}
                else
                {
                    count++;
                }
			}
            
            ns.print(`Sold ${count * 4} hashes for ${ns.nFormat(count * 1000000, "$0.000a")}`);
		}
		
        await ns.sleep(5000);
    }
}