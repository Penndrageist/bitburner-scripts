import * as contractHelper from "contractHelper.ns";

export async function main(ns)
{
    //ns.disableLog("ALL");
    ns.disableLog("sleep");
    
    //ns.enableLog("codingcontract.attempt");
    //ns.enableLog("attempt");
    
    var checkPeriod = 60000 * 0.5;
    
    while(true)
    {
        await contractHelper.ProcessAll(ns);
        
        await ns.sleep(checkPeriod);
    }
}