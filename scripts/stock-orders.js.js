import {GetArg} from "argFunctions.ns";

let numCycles = 1;   		//Each cycle is 5 seconds
let commission = 100000;

function CancelAllOrders(ns, sym, orderList)
{
	if(orderList === null || orderList === undefined) return;
	
	for(var o = 0; o < orderList.length; o++)
	{
		var order = orderList[o];
		ns.cancelOrder(sym, order.shares, order.price, order.type, order.position);
	}
}

let globalMargin;

export async function main(ns)
{
	//ns.disableLog("ALL");
	ns.disableLog("sleep");
	
	//ns.tprint(`globalMargin: ${globalMargin}`);
	
	var orderMargArg = "-om";
	let orderMargin = GetArg(ns, orderMargArg, null);
	
	if(globalMargin !== undefined && ns.isRunning("stock-orders.js", "home", orderMargArg, globalMargin) && globalMargin != orderMargin)
	{
		await ns.kill("stock-orders.js", "home", orderMargArg, globalMargin);
	}
	
	if(orderMargin === null) 
	{
		ns.tprint("Usage: MUST include \"-om [0..1]\" as arguments");
		return;
	}
	globalMargin = orderMargin;
	
	let stockSyms = ns.getStockSymbols();
	
	while(true)
	{
		var orders = ns.getOrders();
		
		//ns.clearLog();
		
		for(var i = 0; i < stockSyms.length; i++)
		{
			var sym = stockSyms[i];
			var position = ns.getStockPosition(sym);
			var symOrders = orders[sym];
			
			if (symOrders === null || symOrders === undefined) symOrders = [];
			
			var longShares = position[0];
			var longPrice = position[1];
			var shortShares = position[2];
			var shortPrice = position[3];
			
			if(longShares === 0 && shortShares === 0)
			{
				// no shares, assumed manually sold
				CancelAllOrders(ns, sym, symOrders);
			}
			else
			{
				var orderShares = 0;
				var orderPrice = -1;
				var orderType = "Stop Sell Order";
				var pos = "";
				
				var boughtPrice = 0;
				
                var commissionBuffer = commission * 2 * 2;
				var currentPrice = ns.getStockPrice(sym);
				
				if(longShares > 0)
				{
					var totalBoughtValue = longShares * longPrice;
					var currentValue = longShares * currentPrice;
					boughtPrice = longPrice;
					
					var interpolatedPrice = longPrice + (currentPrice - longPrice) * orderMargin;
					var expectedProfit = interpolatedPrice * longShares - totalBoughtValue - commissionBuffer;
					
					if(expectedProfit > 0)
					{
						if(symOrders.length === 0 || (symOrders[0].price < interpolatedPrice || symOrders[0].shares != longShares))
						{
							orderShares = longShares;
							orderPrice = interpolatedPrice;
							
							if(symOrders.length !== 0)
							{
							    orderPrice = Math.max(orderPrice, symOrders[0].price);
							}
							
							pos = "L";
						}
					}
				}
				else if(shortShares > 0)
				{ 
					var totalBoughtValue = shortShares * shortPrice;
					var currentValue = shortShares * currentPrice;
					boughtPrice = shortPrice;
					
					var interpolatedPrice = shortPrice - (shortPrice - currentPrice) * orderMargin;
					var expectedProfit = totalBoughtValue - interpolatedPrice * shortShares - commissionBuffer;
					
					if(expectedProfit > 0)
					{
						if(symOrders.length === 0 || (symOrders[0].price > interpolatedPrice || symOrders[0].shares != shortShares))
						{
							orderShares = shortShares;
							orderPrice = interpolatedPrice;
							
							if(symOrders.length !== 0)
							{
							    orderPrice = Math.min(orderPrice, symOrders[0].price);
							}

							pos = "S";
						}
					}
				}
				
				if(pos !== "" && orderShares > 0 && orderPrice > 0)
				{
					CancelAllOrders(ns, sym, symOrders);
					ns.placeOrder(sym, orderShares, orderPrice, orderType, pos);
					ns.print(`Placed ${pos} order for ${sym}. ${orderShares} @ ${ns.nFormat(orderPrice, "$0.000a")} with margin of ${ns.nFormat(orderMargin,"0.0%")} between ${ns.nFormat(boughtPrice, "$0.000a")} and ${ns.nFormat(currentPrice, "$0.000a")}`);
				}
			}
		}
		
		await ns.sleep(5 * 1000 * numCycles + 200);
	}
}