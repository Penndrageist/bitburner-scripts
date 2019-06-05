import {GetFlag, GetArg} from "argFunctions.ns";

let scriptsToRun = 
[
    async function(ns, runOrSpawn) 
    { 
        await ns[runOrSpawn]("nsBotNet.ns", 1); 
    },
    
    async function(ns, runOrSpawn) 
    { 
        await ns[runOrSpawn]("nsBuyCreatePrograms.ns", 1, "--buy", "--all"); 
    },
    
    async function(ns, runOrSpawn) 
    { 
        await ns[runOrSpawn]("check-contracts.ns", 1); 
    },
    
    async function(ns, runOrSpawn) 
    { 
        await ns[runOrSpawn]("manageSleeves.js", 1, "-ia"); 
    },
    
    async function(ns, runOrSpawn) 
    { 
        await ns[runOrSpawn]("spendHashes.js", 1); 
    },
];

export async function main(ns)
{
    for (var i = 0; i < scriptsToRun.length; i++) 
    {
        await scriptsToRun[i](
            ns, 
            i != scriptsToRun.length - 1 ? "run" : "spawn"
        );
    }
    
    if(false)
    {
        ns.run("nullscript", 1);
        ns.spawn("nullscript", 1);
    }
}