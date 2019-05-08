export async function main(ns)
{
    var factionsToAccept = [];
    
    if(ns.args.length > 0)
    {
        factionsToAccept = ns.args;
    }
    
    while(true)
    {
		var ownedAugs = ns.getOwnedAugmentations(true);
		
        ns.checkFactionInvitations().forEach( 
            fac => 
            {
				var factionAugs = ns.getAugmentationsFromFaction(fac);
				
				if(factionAugs.some(aug => aug != "NeuroFlux Governor" && !ownedAugs.includes(aug)))
				{	
					if(
						factionsToAccept.length == 0 || 
						factionsToAccept.includes(fac)
						)
					{
						ns.joinFaction(fac);    
					}
				}
            }
        );
        
        await ns.sleep(1);
    }
}