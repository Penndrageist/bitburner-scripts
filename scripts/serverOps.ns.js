import {GetAllServers_KnownStatic_Unsorted} from "nsFunctions.ns";

let allPortPrograms = [
    "BruteSSH.exe",
    "FTPCrack.exe",
    "relaySMTP.exe",
    "HTTPWorm.exe",
    "SQLInject.exe"
];

let hackscript = ['fullHackServer.js', 0];

function Server(ns, serverName)
{
	this.ns = ns;
	this.serverName = serverName;
	
	this.numPorts = ns.getServerNumPortsRequired(this.serverName);
	
	this.serverRAM = ns.getServerRam(this.serverName);
}

Server.prototype.canHaveMoney = function()
{
    return this.ns.getServerMaxMoney(this.serverName) > 0;
}

Server.prototype.Nuke = function()
{
    if(this.ns.hasRootAccess(this.serverName))
	{
        return true;
	}
	else
	{
		for(var p = 0; p < this.numPorts; p++)
		{
			var prog = allPortPrograms[p];
			
			if(!this.ns.fileExists(prog))
				return false;
			
			switch(prog)
			{
				case "BruteSSH.exe":
					this.ns.brutessh(this.serverName);
					break;
				case "FTPCrack.exe":
					this.ns.ftpcrack(this.serverName);
					break;
				case "relaySMTP.exe":
					this.ns.relaysmtp(this.serverName);
					break;
				case "HTTPWorm.exe":
					this.ns.httpworm(this.serverName);
					break;
				case "SQLInject.exe":
					this.ns.sqlinject(this.serverName);
					break;
			}
		}
		
	    this.ns.nuke(this.serverName);
		
		return true;
	}
	
	return false;
}

Server.prototype.KillLocal = async function(targerServer)
{
	await this.ns.kill(hackscript[0], targerServer, this.serverName);
}

Server.prototype.HackLocal = async function(targerServer, threadCount = 1)
{
	await this.ns.exec(hackscript[0], targerServer, threadCount, this.serverName);
}

export async function main(ns)
{
	ns.disableLog("ALL");
	
	var MEM_COST = ns.getScriptRam("serverOps.js");
	var THIS_SERVER = ns.getHostname();
	let allServerNames = GetAllServers_KnownStatic_Unsorted();
	
	hackscript[1] = ns.getScriptRam(hackscript[0]);
	
	let remainingServers = [];
	
	for(let i = 0; i < allServerNames.length; i++)
	{
		remainingServers.push(
			new Server(
				ns,
				allServerNames[i]
			)
		);
	}
	
	let nukedServers = [];
	let lastCount = 0;
	
	while(remainingServers.length > 0)
	{
	    var workingList = remainingServers.slice();
		remainingServers = [];
	    
	    for(let i = 0; i < workingList.length; i++)
	    {
	        let serv = workingList[i];
		
		    if(!serv.canHaveMoney()) continue;
		
    		if(serv.Nuke())
    		{
    			nukedServers.push(serv);
    		}
			else
			{
				remainingServers.push(serv);
			}
	    }
	    
	    if(nukedServers.length != lastCount)
	    {
	        lastCount = nukedServers.length;
	        /*
			for(let i = 0 ; i < nukedServers.length; i++)
	        {
	            await nukedServers[i].KillLocal(THIS_SERVER);
	        }
			*/
			
			if(ns.scriptKill(hackscript[0], THIS_SERVER))
				await ns.sleep(6000);
			else
				await ns.sleep(1);
	        
			var serverRam = ns.getServerRam(THIS_SERVER);
			var availableRam = serverRam[0] - MEM_COST - serverRam[1];
			if(THIS_SERVER == "home") availableRam *= 0.9;
			let threadsPerScript = Math.floor(availableRam / hackscript[1] / lastCount);
			
	        for(let i = 0; i < nukedServers.length; i++)
	        {
	            await nukedServers[i].HackLocal(THIS_SERVER, threadsPerScript);
	        }
	    }
	    else
	    {
	        await ns.sleep(1000);
	    }
	}
	
	ns.tprint(`ServerOps Done. Server ${ns.getHostname()} fully loaded.`);
}