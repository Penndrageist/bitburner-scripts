import {GetArg} from "argFunctions.ns";

async function initialiseServer(ns, serverName)
{
    var serverops_script = "serverOps.ns";
	var required_files = [
		serverops_script, 
		"fullHackServer.js",
		"nsFunctions.ns"
	];
		
	ns.killall(serverName);

	await ns.sleep(6500);

	ns.scp(required_files, "home", serverName);
	
	await ns.exec(serverops_script, serverName, 1);
}

export async function main(ns)
{
	var maxToBuy = GetArg(ns, "--count", ns.getPurchasedServerLimit());
	var ramToBuy = GetArg(ns, "--ram", ns.getPurchasedServerMaxRam());

	var purchased_servs = ns.getPurchasedServers();

	for(var i = 0; i < purchased_servs.length; i++)
	{
		var pServ = purchased_servs[i];
		
		await initialiseServer(ns, pServ);
	}

	while(purchased_servs.length < maxToBuy)
	{
	    await ns.sleep(1);
	    
		var result = ns.purchaseServer("serv-slave-" + purchased_servs.length, ramToBuy);
		
		if(result === "")
		{
			if(purchased_servs.length >= 25)
				break;
			else
				continue;
		}
		else
		{
			ns.tprint('New Server Purchased. Name: ' + result);
			
			await initialiseServer(ns, result);
			
			purchased_servs.push(result);
		}
	}
}