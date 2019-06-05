import * as contractHelper from "contractHelper.ns";

export async function main(ns)
{
    //ns.disableLog("ALL");
    ns.disableLog("sleep");
    
    //ns.enableLog("codingcontract.attempt");
    //ns.enableLog("attempt");
    
    var checkPeriod = 60000 * 0.5;
    
    const CONTRACT_ATTEMPTER = "attemptContract.js";
    const HOME_SERVER = "home";
    
    while(true)
    {
        var contracts = contractHelper.GetContracts(ns);
        
        for(var i = 0; i < contracts.length; i++)
        {
            if(!ns.isRunning(
                        CONTRACT_ATTEMPTER, 
                        HOME_SERVER, 
                        contracts[i].contractName, 
                        contracts[i].serverLocation)
              )
            {
                await ns.run(
                    CONTRACT_ATTEMPTER,
                    1,
                    contracts[i].contractName, 
                    contracts[i].serverLocation);
            }
        }
        
        await ns.sleep(checkPeriod);
    }
}