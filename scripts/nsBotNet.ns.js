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
			
            //this.ns.print(`Checking -> this.allPortPrograms[${p}] == ${prog}`);
        
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

Server.prototype.Boot = async function()
{	
	this.ns.scp(hackscript[0], "home", this.serverName);

	var available_ram = this.ns.getServerRam(this.serverName)[0];
	var num_threads = Math.max(Math.floor(available_ram / hackscript[1]), 0);

	if (num_threads >= 1)
	{
		await this.ns.exec(hackscript[0], this.serverName, num_threads, this.serverName);
	}
}


export async function main(ns)
{
    ns.disableLog("ALL");
    
	let allServerNames = GetAllServers_KnownStatic_Unsorted();
	
	hackscript[1] = ns.getScriptRam(hackscript[0], "home");
	
	let allServers = [];
	
	
	for(let i = 0; i < allServerNames.length; i++)
	{
		allServers.push(
			new Server(
				ns,
				allServerNames[i]
			)
		);
	}
	
	
	while(allServers.length > 0)
	{
		let serv = allServers.shift();
		
		if(!serv.Nuke())
		{
			allServers.push(serv);
			
			await ns.sleep(1);
			
			continue;
		}
		
		ns.print(`Nuked ${serv.serverName}. Taking control.`);
		
		ns.killall(serv.serverName);
		
		await ns.sleep(6500);
		
		await serv.Boot();
	}
}