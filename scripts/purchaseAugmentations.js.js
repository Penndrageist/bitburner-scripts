export async function main(ns)
{
    var ownedAugs = ns.getOwnedAugmentations(true);
	var factionList = ns.getCharacterInformation().factions;
	var augmentationDict = {};
	
	factionList.forEach(fac =>
	{
		var factionRep = ns.getFactionRep(fac);
		var factionAugmentations = ns.getAugmentationsFromFaction(fac);
        
        ns.print(`Checking ${fac} [${factionRep}], augmentations: [${factionAugmentations}]`);
		
		for(var i = 0; i < factionAugmentations.length; i++)
		{
			var augName = factionAugmentations[i];
			var augRepCost = ns.getAugmentationCost(augName)[0];
			
			//ns.print(`Checking ${fac} [${factionRep}], augmentation: ${augName} [${augRepCost}]`);
			
			if(factionRep > augRepCost && !ownedAugs.includes(augName))
			{
				augmentationDict[augName] = fac;
			}
		}
	});
	
	// now have available augmentation/rep pairs
	var augFacList = [];
	
	for(var aug in augmentationDict)
	{
		augFacList.push([aug, augmentationDict[aug]]);
	}
	
	// sort most to least expensive by $$$
	augFacList.sort((augPairA, augPairB) =>
	{
		var augNameA = augPairA[0];
		var augMoneyCostA = ns.getAugmentationCost(augNameA)[1];
		var augPrereqsA = ns.getAugmentationPrereq(augNameA);
		
		var augNameB = augPairB[0];
		var augMoneyCostB = ns.getAugmentationCost(augNameB)[1];
		var augPrereqsB = ns.getAugmentationPrereq(augNameB);
		
		if(augPrereqsA.includes(augNameB))
		{
			return 1;
		}
		else if(augPrereqsB.includes(augNameA))
		{
			return -1;
		}
		else 
		{
			return augMoneyCostB - augMoneyCostA;
		}
	});
	
	for(var i = 0; i < augFacList.length; i++)
	{
		var pair = augFacList[i];
		var augName = pair[0];
		var facName = pair[1];
        
		ns.print(`${ns.nFormat(ns.getAugmentationCost(augName)[1], "$0.000a")} ==> ${facName} :: ${augName} ::> [${ns.getAugmentationPrereq(augName)}]`);
		
        if(augName == "NeuroFlux Governor") continue;
		
        //continue;
        
		if(ns.purchaseAugmentation(facName, augName))
		{
			ns.tprint(`Bought ${augName} from ${facName}`);
		}
	}
    
    ns.tprint(`Finished.`);
}