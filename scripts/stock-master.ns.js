import {GetFlag, GetArg} from "argFunctions.ns";

//Requires access to the TIX API and the 4S Mkt Data API

let fracH = 0.0001;            // amount of corpus to keep each buying cycle
let commission = 100000;    //Buy or sell commission
let numCycles = 2;          //Each cycle is 5 seconds

let NUM_FORMAT = "$0.000a";

function format(num){
    let symbols = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc"];
    
    let isNeg = Math.sgn(num) < 0;
    let workingNum = num * Math.sgn(num);
    
    let i = 0;
    for(; (workingNum >= 1000) && (i < symbols.length); i++) workingNum /= 1000;
    
    return ( (isNeg) ? "-$" : "$" ) + workingNum.toFixed(3) + symbols[i];
}

function Stock(ns, sym, longOnly)
{
    this.ns = ns;
    this.sym = sym;
    this.maxShares = ns.getStockMaxShares(sym);
    this.longOnly = longOnly;
}

Stock.prototype.Refresh = function()
{
    this.price = this.ns.getStockPrice(this.sym);
    
    this.positions = this.ns.getStockPosition(this.sym);
    
    this.longShares = this.positions[0];
    this.buyPrice = this.positions[1];
    this.shortShares = this.positions[2];
    this.shortBuyPrice = this.positions[3];
    
    this.vol = this.ns.getStockVolatility(this.sym);
    this.prob = 2 * (this.ns.getStockForecast(this.sym) - 0.5);
    
    this.expRet = this.vol * this.prob / 2;
        
    if(this.longOnly)
    {
        this.buyPosition = "L";
    }
    else
    {
        this.expRet = Math.abs(this.expRet);
        this.buyPosition = this.prob > 0 ? "L" : "S";
    }
};

Stock.prototype.ExpectedReturn = function()
{
    return this.expRet;
};

Stock.prototype.TotalShares = function()
{
    return this.longShares + this.shortShares;
};

Stock.prototype.CorpusValue = function()
{
    return this.price * this.TotalShares();
};

Stock.prototype.LongProfit = function()
{
    return this.longShares * (this.price - this.buyPrice);
};

Stock.prototype.ShortProfit = function()
{
    return this.shortShares * (this.shortBuyPrice - this.price);
};

Stock.prototype.Flipped = function()
{
    return (this.buyPosition == "L" && this.shortShares > 0) ||
            (this.buyPosition == "S" && this.longShares > 0);
};

Stock.prototype.SellLong = function()
{
    if(this.longShares > 0)
    {
        var subProfit = this.LongProfit() - 2 * commission;
        
        this.ns.print(`Sold ${this.longShares} Long ${this.sym} shares for ${(subProfit > 0 ? "profit" : "loss")} of ${format(subProfit)}`);
        this.ns.sellStock(this.sym, this.longShares);
        this.longShares = 0;
        
        return subProfit;
    }
    
    return 0;
};

Stock.prototype.SellShort = function()
{
    if(this.shortShares > 0 && !this.longOnly)
    {
        var subProfit = this.ShortProfit() - 2 * commission;
        
        this.ns.print(`Sold ${this.shortShares} Short ${this.sym} shares for ${(subProfit > 0 ? "profit" : "loss")} of ${format(subProfit)}`);
        this.ns.sellShort(this.sym, this.shortShares);
        this.shortShares = 0;
        
        return subProfit;
    }
    
    return 0;
};

Stock.prototype.SellFlipped = function()
{
    var profit = 0;
    
    switch(this.buyPosition)
    {
        case "L":
            profit += this.SellShort();
            break;
        case "S":
            profit += this.SellLong();
            break;
    }
    
    return profit;
};

Stock.prototype.SellAll = function()
{
    var profit = 0;
    
    profit += this.SellLong();
    profit += this.SellShort();
    
    return profit;
};

Stock.prototype.Buy = function(numShares)
{
    let buyPrice = 0;
    
    switch(this.buyPosition)
    {
        case "L":
            if(this.longShares === 0)
            {
                buyPrice = this.ns.buyStock(this.sym, numShares);
            }
            break;
        case "S":
            if(this.shortShares === 0 && !this.longOnly)
            {
                buyPrice = this.ns.shortStock(this.sym, numShares);
            }
            break;
    }
    
    if(buyPrice !== 0)
    {
        this.ns.print(`Bought ${numShares} ${this.buyPosition} ${this.sym} for ${format(numShares * this.price)}.`);
        return buyPrice * numShares + commission;
    }
    
    return 0;
};

Stock.prototype.getStockSaleGain = function()
{
	var numStocks = this.buyPosition == "L" ? this.longShares : this.shortShares;
	return this.ns.getStockSaleGain(this.sym, numStocks, this.buyPosition);
};

Stock.prototype.getStockPurchaseCost = function(numStocks)
{
	return this.ns.getStockPurchaseCost(this.sym, numStocks, this.buyPosition);
};

function refresh(ns, stocks, myStocks)
{
    let corpus = ns.getServerMoneyAvailable("home");
    myStocks.length = 0;
    
    for(let i = 0; i < stocks.length; i++)
    {
        let stock = stocks[i];
        stock.Refresh();
        corpus += stock.CorpusValue();
        if(stock.TotalShares() > 0)
        {
            myStocks.push(stock);
        }
    }
    
    stocks.sort(function(a, b){return b.ExpectedReturn() - a.ExpectedReturn()});
    return corpus;
}

export async function main(ns) {
    
    //Initialise
    ns.disableLog("ALL");
    
    var longOnly = GetFlag(ns, "-l");
    let adaptive = !GetFlag(ns, "-na");
    
    let localFracH = GetArg(ns, "--fracH", fracH);
    
    let stocks = [];
    let myStocks = [];
    let corpus = 0;
    let allSymbols = ns.getStockSymbols();
    for(let i = 0; i < allSymbols.length; i++)
    {
        stocks.push(
            new Stock(ns, allSymbols[i], longOnly)
        );
    }
        
    let stockLimit = GetArg(ns, "-m");
    if(stockLimit === null || adaptive) 
    {
        stockLimit = 1;
    }
    else
    {
        if(stockLimit == "max" || stockLimit <= 0)
            stockLimit = stocks.length;
        else
            stockLimit = Math.min(stockLimit, stocks.length);
    }
    
    ns.print(`StockMaster: stockLimit => ${stockLimit}`);
    
    var LONG_SLEEP = 60000; // 1 minute
    var TINY_SLEEP = 1; // 1 ms
    while(!ns.purchase4SMarketData()) await ns.sleep(TINY_SLEEP);
    while(!ns.purchase4SMarketDataTixApi()) await ns.sleep(TINY_SLEEP);
    
    await ns.sleep(5 * 1000 * numCycles + 200);
    
    let runningProfit = 0;
        
    while(true)
    {
        ns.clearLog();
        
        corpus = refresh(ns, stocks, myStocks);
        
        var corpusAtStart = corpus;
        
        let cycleProfit = 0;

        let numWithMaxStocks = 0;
        
        // Sell wrong position shares
        for (let i = 0; i < myStocks.length; i++)
        {
            if(myStocks[i].TotalShares() == myStocks[i].maxShares)
                numWithMaxStocks++;

            if(myStocks[i].Flipped())
            {
                cycleProfit += myStocks[i].SellFlipped();
                
                corpus -= commission;
                cycleProfit -= commission;
            }
        }
        
        if(adaptive)
        {
            stockLimit = Math.min(numWithMaxStocks+1, stocks.length);
        }

        if(stockLimit < stocks.length)
        {
            //Sell underperforming shares
            for (let i = 0; i < myStocks.length; i++)
            {
                if(stocks[stockLimit - 1].ExpectedReturn() > myStocks[i].ExpectedReturn() && myStocks[i].TotalShares() > 0)
                {
                    cycleProfit += myStocks[i].SellAll();
                    
                    corpus -= commission;
                    cycleProfit -= commission;
                }
            }
        }
        
        ns.print(`------------------------------------------`);
        
        //Buy shares with cash remaining in hand
        let cashToSpend = ns.getServerMoneyAvailable("home") - (localFracH * corpus);
        
        for (let s = 0; s < stockLimit && cashToSpend > commission; )
        {
            let stock = stocks[s];
            
            let maxShares = stock.maxShares;
            
            if(maxShares == stock.TotalShares())
            {
                // unable to buy more, so skip
                s++;
                continue;
            }
        
            let numShares = Math.floor((cashToSpend - commission)/stock.price);
            numShares = Math.min(numShares, maxShares - stock.TotalShares());
            
			//numShares = Math.min(numShares, 100000);
			
            while(numShares > 0)
            {
                if ((numShares * stock.ExpectedReturn() * stock.price * numCycles) > commission && stock.getStockPurchaseCost(numShares) <= cashToSpend)
                    break;
                
                numShares -= 1;
            }
            
            // bought some, so continue to the next stock
            let spent = stock.Buy(numShares);

            if(spent > 0)
            {
                cashToSpend -= spent;
                cycleProfit -= commission;
            }

            if(cashToSpend < commission)
            {
                break;
            }

            s++;
        }
        
        runningProfit += cycleProfit;
        
        ns.print(`------------------------------------------`);
        if(adaptive) ns.print(`Adaptive Stock Limit: ${stockLimit}`);
        ns.print(`Corpus @ cycle start: ${ns.nFormat(corpusAtStart, NUM_FORMAT)}`);
        ns.print(`Profit this cycle: ${ns.nFormat(cycleProfit, NUM_FORMAT)}`);
        ns.print(`Running Standing: ${ns.nFormat(runningProfit, NUM_FORMAT)}`);
        ns.print(`==========================================`);
        
        //ns.print('Tick ...');
        await ns.sleep(5 * 1000 * numCycles + 200);
    }
}