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

export async function main(ns)
{
    ns.disableLog("sleep");
    
	var count = 0;
    while(ns.hacknet.spendHashes(OPTIONS.sellForMoney))
    {
		count++;
        await ns.sleep(1);
    }
	
	ns.tprint(`Sold ${count * 4} hashes for ${ns.nFormat(count * 1000000, "$0.000a")}`);
}