/*
export function GetAllServers(ns)
{
    var serversArray = [[],[],[],[],[],[]];
    
    var pollingArray = ns.scan('home');
    var visitedArray = [];
    var ignoreServers = ['home', 'darkweb'];
    
    for(i = 0; i < 25; i++)
        ignoreServers.push("serv-slave-" +i);
        
        
    while(pollingArray.length > 0)
    {    
    	// get the first element
    	var serverName = pollingArray.shift();
    	
    	if(ignoreServers.includes(serverName))
    	    continue;
    	
    	visitedArray.push(serverName);
    	
    	var newServers = ns.scan(serverName);
    	
    	for(var i=0; i< newServers.length; i++)
    	{
    		if(!ns.serverExists(newServers[i]))
    			continue;
    	
    	    if(pollingArray.includes(newServers[i]))
    	        ns.print(newServers[i] + " already in pollingArray.");
	        else if(visitedArray.includes(newServers[i]))
    	        ns.print(newServers[i] + " already visited.");
	        else if(ignoreServers.includes(newServers[i]))
    	        ns.print(newServers[i] + " is to be ignored.");
    	    else
    	    {
    	        ns.print(newServers[i] + " added to pollingArray.");
    			pollingArray.push(newServers[i]);
    		}
    	}
    	
    	// just incase
    	await ns.sleep(1);
    }
    
    for(i = 0; i < visitedArray.length; i++)
    {
        // just in case it was deleted during operation
        if(!serverExists(visitedArray[i]))
			continue;
			
        var reqOpenPorts = ns.getServerNumPortsRequired(visitedArray[i]);
        serversArray[reqOpenPorts].push(visitedArray[i]);
    }
    
    return serversArray;
}
*/

export function GetAllServers_KnownStatic_Unsorted()
{
    return [
        "iron-gym","foodnstuff","sigma-cosmetics",
        "joesguns","hong-fang-tea","harakiri-sushi",
        "max-hardware","nectar-net","zer0","CSEC",
        "omega-net","silver-helix","phantasy","neo-net",
        "johnson-ortho","comptek","crush-fitness",
        "netlink","the-hub","avmnite-02h","I.I.I.I",
        "catalyst","syscore","summit-uni","zb-institute",
        "rothman-uni","millenium-fitness","alpha-ent",
        "aevum-police","lexo-corp","rho-construction",
        "global-pharm","aerocorp","galactic-cyber",
        "snap-fitness","deltaone","unitalife","omnia",
        "icarus","solaris","univ-energy","defcomm",
        "zeus-med","taiyang-digital","nova-med",
        "zb-def","infocomm","microdyne","applied-energetics",
        "titan-labs","run4theh111z","fulcrumtech","vitalife",
        "helios","stormtech","omnitek","kuai-gong","4sigma",
        ".","b-and-a","powerhouse-fitness","nwo","clarkinc",
        "blade","fulcrumassets","megacorp","ecorp","The-Cave"
        ];
}

export function GetAllServers_KnownStatic_Sorted()
{
    return [
            [ // Ports [0] 
                "foodnstuff","sigma-cosmetics",
                "joesguns","hong-fang-tea",
                "harakiri-sushi","nectar-net"
            ],
            [ // Ports [1] 
                "iron-gym","zer0","max-hardware",
                "CSEC","neo-net"
            ],
            [ // Ports [2]
                "omega-net","silver-helix","phantasy",
                "johnson-ortho","crush-fitness",
                "the-hub","avmnite-02h"
            ],
            [ // Ports [3]
                "comptek","netlink","I.I.I.I",
                "catalyst","summit-uni","rothman-uni",
                "millenium-fitness","rho-construction"
            ],
            [ // Ports [4] 
                "syscore","alpha-ent","aevum-police",
                "lexo-corp","global-pharm","snap-fitness",
                "unitalife","univ-energy","nova-med",
                "zb-def","applied-energetics","run4theh111z","."
            ],
            [ // Ports [5] 
                "zb-institute","aerocorp","galactic-cyber",
                "deltaone","omnia","icarus","solaris",
                "defcomm","zeus-med","taiyang-digital",
                "infocomm","microdyne","titan-labs",
                "fulcrumtech","vitalife","helios","stormtech",
                "omnitek","kuai-gong","4sigma","b-and-a",
                "powerhouse-fitness","nwo","clarkinc","blade",
                "fulcrumassets","megacorp","ecorp","The-Cave"
            ]
        ];
}