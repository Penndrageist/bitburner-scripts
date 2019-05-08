export async function main(ns)
{
    var stockSyms = ns.getStockSymbols();

    for(var i = 0; i < stockSyms.length; i++)
    {
        var sym = stockSyms[i];
        var stockPos = ns.getStockPosition(sym);

        var longShares = stockPos[0];
        if(longShares > 0) 
        {
            ns.sellStock(sym, longShares);
            ns.tprint(`Sold ${longShares} Long shares of ${sym}`);
        }

        var shortShares = stockPos[2];
        if(shortShares > 0)
        {
            ns.sellShort(sym, shortShares);
            ns.tprint(`Sold ${shortShares} Short shares of ${sym}`);
        }
    }	
}