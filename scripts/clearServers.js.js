export async function main(ns)
{
	var purchased_servs = ns.getPurchasedServers();
	var pServ;
	
	while(purchased_servs.length > 0)
	{
		pServ = purchased_servs.shift();
		
		var servRam = ns.getServerRam(pServ);
		
		if(servRam[1] === 0)
		{
			if(ns.deleteServer(pServ))
			{
				ns.tprint("Deleted " + pServ);
			}
			else
			{
				ns.tprint("Failed to delete " + pServ);
				ns.killall(pServ);
				purchased_servs.push(pServ);
			}
		}
		else
		{
			ns.tprint("Killing scripts on " + pServ);
			ns.killall(pServ);
			purchased_servs.push(pServ);
		}
		
	    await ns.sleep(6100);
	}
}