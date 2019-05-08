export async function main(ns)
{
	/*
	for(var func in ns.sleeve)
	{
		ns.tprint(`func: ${func}`);
	}
	*/
	
	var buyThisCycle = false;
    while(true)
    {
        var numSleeves = ns.sleeve.getNumSleeves();
        for(var i = 0; i < numSleeves; i++)
        {
            var characterInfo = ns.getCharacterInformation();
            var sleeveStatus = ns.sleeve.getSleeveStats(i);
    
			// getSleeveAugmentations
			if(false && buyThisCycle)
			{
				var buyableAugs = ns.sleeve.getSleevePurchasableAugs(i);
				buyableAugs.forEach( aug => { 
					if(ns.sleeve.purchaseSleeveAug(i, aug))
					{
						ns.print(`Bought ${aug} for sleeve #${i}`);
					}
				});
			}
			
            //ns.print(`Sleeve[${i}]: sync -> ${sleeveStatus.sync}`);
            const syncMax = 100;
            
            if(sleeveStatus.sync < syncMax)
            {
                ns.sleeve.setToSynchronize(i);
                continue;
            }
            
            var worked = false;
			
			var jobs = characterInfo.jobs;
			jobs.sort((a,b) => { return ns.getCompanyRep(a) - ns.getCompanyRep(b); });

            for(var j = 0; j < jobs.length && !worked; j++)
            {
                worked = ns.sleeve.setToCompanyWork(i, jobs[j]);
            }

            if(worked) continue;
            
            ns.sleeve.setToCommitCrime(i, "Homicide");
            
            continue;
            
            if(sleeveStatus.shock > 0)
            {
                ns.sleeve.setToShockRecovery(i);
                continue;
            }
        }
		
        buyThisCycle = !buyThisCycle;
        
		await ns.sleep(60000);
    }
}