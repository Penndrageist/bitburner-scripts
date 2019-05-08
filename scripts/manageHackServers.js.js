export async function main(ns)
{
    ns.disableLog("sleep");
    
    var nodeStats = null;
    var i;
    
    while(true)
    {
        var numNodes = ns.hacknet.numNodes();
        
        var nodeLevel = 0; // max level == ?
        var nodeRam = 0; // max ram == 8192 (1 << 13)
        var nodeCore = 0; // max cores == ?
        var nodeCache = 0; // max cache == 15
        
        for(i = 0; i < numNodes; i++)
        {
            nodeStats = ns.hacknet.getNodeStats(i);
            
            nodeLevel = Math.max(nodeLevel, nodeStats.level);
            nodeRam = Math.max(nodeRam, nodeStats.ram);
            nodeCore = Math.max(nodeCore, nodeStats.cores);
            nodeCache = Math.max(nodeCache, nodeStats.cache);
        }
        
        for(i = 0; i < numNodes; i++)
        {
            nodeStats = ns.hacknet.getNodeStats(i);
            
            if(nodeStats.level < nodeLevel)
            {
                ns.hacknet.upgradeLevel(i, 1);
            }
            
            if(nodeStats.ram < nodeRam)
            {
                ns.hacknet.upgradeRam(i, 1);
            }
            
            if(nodeStats.cores < nodeCore)
            {
                ns.hacknet.upgradeCore(i, 1);
            }
            
            if(nodeStats.cache < nodeCache)
            {
                ns.hacknet.upgradeCache(i, 1);
            }
        }
        
        await ns.sleep(100);
    }
}