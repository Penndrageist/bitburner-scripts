import * as serverLists from "nsFunctions.ns";
import {GetFlag, GetArg} from "argFunctions.ns";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

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
    ns.disableLog("getServerSecurityLevel");
    ns.disableLog("getServerMaxMoney");
    
    var nodeStats = null;
    var i;
	var numHashes = 0;
	var hashCost = 0;
    
	var preferenceList = [
		OPTIONS.generateCodingContract,
		OPTIONS.sellForCorporation,
		OPTIONS.exchangeForCorporationResearch,
		OPTIONS.exchangeForBladeBurnerRank,
		OPTIONS.exchangeForBladeBurnerSP,
	];
	
	var specificTask = null;
	if(!GetFlag(ns, "-is"))
	{
		preferenceList.push(OPTIONS.reduceMinServerSec);
		preferenceList.push(OPTIONS.increaseMaxServerMoney);
	}
    else if((specificTask = GetArg(ns, "--focused", null)) !== null)
    {
        preferenceList = [OPTIONS[specificTask]];
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
            if(preferenceList[i] == OPTIONS.reduceMinServerSec ||
              preferenceList[i] == OPTIONS.increaseMaxServerMoney)
            {
                var targetServer = '';
                var serverList = serverLists.GetAllServers_KnownStatic_Unsorted();
                
                if(preferenceList[i] == OPTIONS.reduceMinServerSec)
                {
                    var minSecLevel = 3;
                    serverList = serverList.filter(s => ns.getServerSecurityLevel(s) > minSecLevel);
                    //serverList.sort((a,b) => ns.getServerSecurityLevel(b) - ns.getServerSecurityLevel(a));
                    serverList.sort((a,b) => ns.getServerSecurityLevel(a) - ns.getServerSecurityLevel(b));
                }
                else if(preferenceList[i] == OPTIONS.increaseMaxServerMoney)
                {
                    serverList = serverList.filter(s => 
                                                  s != "CSEC" && 
                                                  s != "avmnite-02h" && 
                                                  s != "run4theh111z" && 
                                                  s != "I.I.I.I");
                    serverList = serverList.filter(s => ns.getServerMaxMoney(s) > 0);
                    serverList.sort((a,b) => ns.getServerMaxMoney(a) - ns.getServerMaxMoney(b));
                }
                
                if(serverList.length > 0)targetServer = serverList[0];
                
                if(targetServer !== '' && ns.hacknet.spendHashes(preferenceList[i], targetServer))
                {
                    ns.print(`Spent ${hashCost} on ${preferenceList[i]} -> ${targetServer}`);
                    ns.print(`${targetServer}: SecLevel -> ${ns.nFormat(ns.getServerSecurityLevel(targetServer), "0.000")}`);
                    ns.print(`${targetServer}: MaxMoney -> ${ns.nFormat(ns.getServerMaxMoney(targetServer), "$0.000a")}`);
                    break;
                }
            }
            else if(ns.hacknet.spendHashes(preferenceList[i]))
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