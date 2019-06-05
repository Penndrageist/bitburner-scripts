import {GetFlag, GetArg} from "argFunctions.ns";

let scriptsToRun = 
[
    async function(ns, ignoreBlocking) { await ns.run("nsBotNet.ns", 1); },
    async function(ns, ignoreBlocking) { await ns.run("nsBuyCreatePrograms.ns", 1, "--buy", "--all"); },
    
    //async function(ns, ignoreBlocking) { await ns.run("check-contracts.ns", 1); },
    async function(ns, ignoreBlocking) { await ns.run("distributeContracts.js", 1); },
    
    async function(ns, ignoreBlocking) { await ns.run("stock-master.ns", 1); },
	
    async function(ns, ignoreBlocking) { await ns.run("nsAutoBladeBurner.ns", 1); },
	
    async function(ns, ignoreBlocking) 
    { 
        await ns.run("acceptFactions-Singularity.js", 1);
        
        if(!ignoreBlocking)
        {
            await ns.run("nsWorkFactions.ns", 1, "--sec"); 
        }
        
        /*
        if(ns.getOwnedAugmentations().length >= (30 * ns.getBitNodeMultipliers().DaedalusAugsRequirement))
        { 
            //await ns.run("acceptFactions-Singularity.js", 1, "Daedalus");
            await ns.run("nsWorkFactions.ns", 1, "--sec", "--override", "Daedalus"); 
        }
        else
        {
            await ns.run("nsWorkFactions.ns", 1, "--sec"); 
        }
        */
    },
    
    async function(ns, ignoreBlocking) { await ns.run("manageSleeves.js", 1, "-ia"); } ,
    //async function(ns, ignoreBlocking) { await ns.run("manageHackServers.js", 1); } ,
    
    //async function(ns, ignoreBlocking) { await ns.run("spendHashes.js", 1, "-is"); },
    async function(ns, ignoreBlocking) { await ns.run("spendHashes.js", 1); },
    
    //async function(ns) { if(ns.getCharacterInformation().bitnode == 2) { await ns.run("gangManager.js", 1); }} ,
    async function(ns, ignoreBlocking) { await ns.run("gangManager.js", 1); },
    //async function(ns, ignoreBlocking) { await ns.run("gangManager.js", 1, "--focused"); },
    
    async function(ns, ignoreBlocking) { if(ns.getServerRam("home")[0] >= (1 << 11)) { await ns.run("serverOps.ns", 1); }} ,
    
    //async function(ns) { await ns.run("nsWorkCompanies.ns", 1, "-s", "45000"); },
];

function Clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
};

export async function main(ns)
{
    var ignoreBlocking = GetFlag(ns, "-ib") || true;
    var ignoreUpgrading = GetFlag(ns, "-iu");
    var ramShift = GetArg(ns, "--ramShift", 30);
    
    for (var i = 0; i < scriptsToRun.length; i++) 
    {
        await scriptsToRun[i](ns, ignoreBlocking);
    }
    
    ramShift = Clamp(ramShift, 1, 30);
    // can't shift higher than 30
    var targetHomeRam = 1 << ramShift;
    ns.tprint(`Singularity attempting to upgrade home server RAM to ${targetHomeRam}`);        
    var BUSY_SLEEP_TIME = 1000;
    while (!ignoreUpgrading && ns.getServerRam("home")[0] < targetHomeRam) 
    {
        if(ns.upgradeHomeRam())
        {
            ns.tprint(`Upgraded Home server RAM to ${ns.getServerRam("home")[0]}`);
            await ns.run("serverOps.js", 1);
        }
        await ns.sleep(BUSY_SLEEP_TIME);
    }
    
    ns.tprint(`Singularity startup complete. Home server RAM is ${ns.getServerRam("home")[0]}`);        
}