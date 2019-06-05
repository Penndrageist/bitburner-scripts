export async function main(ns)
{
	ns.disableLog("getServerBaseSecurityLevel");
	ns.disableLog("getServerMinSecurityLevel");
	ns.disableLog("getServerMaxMoney");
	ns.disableLog("getServerMoneyAvailable");
	ns.disableLog("getServerSecurityLevel");
	
	let server = ns.args.length > 0 ? ns.args[0] : ns.getHostname();
	let thisScript = ns.getScriptName();
	let thisScriptDetails = ns.ps().filter(script => script.filename == thisScript)[0];
	let thisScriptThreads = thisScriptDetails.threads;

	let secInterp = 0.9;
	let moneyPerc = 0.75;
	
	let baseSecLevel = ns.getServerBaseSecurityLevel(server);
	let minSecLevel = ns.getServerMinSecurityLevel(server);
	
	let maxMoney = ns.getServerMaxMoney(server);
	let minHackMoney = maxMoney * moneyPerc;
	
	let moneyFormat = "$0.000a";
	let secFormat = "0.00";
	
	var func = "";
	
	ns.clearLog();
	
	while(true)
	{
		ns.print(`========================================`);
		
		var currentMoney = ns.getServerMoneyAvailable(server);
		var currentSecLevel = ns.getServerSecurityLevel(server);
		
		if(currentSecLevel > minSecLevel)
		{
			func = "weaken";
		}
		else if(currentMoney < minHackMoney ||
		    ns.getHackingLevel() < ns.getServerRequiredHackingLevel(server))
		{
			func = "grow";
		}
		else
		{
			func = "hack";
		}
		
		ns.print(`Money: ${ns.nFormat(minHackMoney, moneyFormat)} <= ${ns.nFormat(currentMoney, moneyFormat)} <= ${ns.nFormat(maxMoney, moneyFormat)}`);
		ns.print(`SecLev: ${ns.nFormat(minSecLevel, secFormat)} <= ${ns.nFormat(currentSecLevel, secFormat)}`);
		
		//await ns[func](server);
		
		// determine if action should change?
		switch(func)
		{
			case "weaken":
				await ns.weaken(server);
				break;
			case "grow":
				await ns.grow(server);
				break;
			case "hack":
				await ns.hack(server);
				break;
		}
		
		ns.print(`========================================`);
	}
}