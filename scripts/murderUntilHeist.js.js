import * as sActFuncs from "singularityActions.js";

export async function main(ns)
{
    ns.disableLog("sleep");
    
    let sleepTime = 1;
    
    let crimeChance = 0;
    while((crimeChance = ns.getCrimeChance("Heist")) < 1.0)
    {
        ns.print(`Heist chance: ${ns.nFormat(crimeChance, "0.00%")}`);
        sActFuncs.commitCrime(ns, "Homicide");
        
        do
        {
            await ns.sleep(sleepTime);
        }
        while(sActFuncs.currentAction(ns).type == sActFuncs.crimeAction());
    }
}