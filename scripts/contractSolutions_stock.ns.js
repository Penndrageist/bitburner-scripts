function totalValueOfPairs(stockPairs, maxTrades = -1)
{
	var profit = 0;
	if(maxTrades <= 0) maxTrades = stockPairs.length;
	
	var stockPairsCpy = stockPairs.slice();
	stockPairsCpy.sort((a,b)=>{return (b[1]-b[0]) - (a[1]-a[0]);});
	
	for(var i = 0; i < maxTrades && i < stockPairsCpy.length; i++)
	{
		profit += stockPairsCpy[i][1] - stockPairsCpy[i][0];
	}
	
	return profit;
}

let sleepTime = 1;
async function recursiveMergeStock(outputList, pairsToMerge, maxStepSize, maxTrades, ns = null, maxDepth=20)
{
	if(pairsToMerge.length <= maxTrades || maxStepSize <= 0 || maxDepth <= 0)
	{
        if(ns !== null) await ns.sleep(1);
        
		outputList.push(pairsToMerge.slice());
		return;
	}
	
	for(var i = 0; i < pairsToMerge.length - 1; i++)
	{
        if(ns !== null) await ns.sleep(1);
        
		var pairA = pairsToMerge[i];
		var lowValue = pairA[0];
		var highValue = pairA[1];
		
		var mip = [];
		
		var maxIndex = Math.min(pairsToMerge.length, i + maxStepSize + 1);
		
		for(var j = i + 1; j < maxIndex; j++)
		{
			var pairB = pairsToMerge[j];
			
			// Next pair's low value is lower. Can't merge further right.
			if(lowValue >= pairB[0]) break;
			
			if(lowValue < pairB[0] && pairB[1] > highValue)
			{
				mip = [i, j];
				highValue = pairB[1];
			}
		}
		
		if(mip.length == 2)
		{
			var workingPairs = pairsToMerge.slice();
			
			var mergedPairs = [
				workingPairs[mip[0]][0],
				workingPairs[mip[1]][1]
			];
			
			//if(ns !== null) ns.tprint(`Merging [${workingPairs[mip[0]]}] & [${workingPairs[mip[1]]}] into [${mergedPairs}]`);
			
			//if(ns !== null) ns.tprint(`Was: ${workingPairs}`);
			workingPairs.splice(mip[0], mip[1] - mip[0] + 1, mergedPairs);
			//if(ns !== null) ns.tprint(`Now: ${workingPairs}`);
			
			await recursiveMergeStock(outputList, workingPairs, workingPairs.length - 1, maxTrades, ns, maxDepth - 1);
		}
        
        if(ns !== null)
        {
            await ns.sleep(sleepTime);
        }
	}
	
    if(ns !== null)
    {
        await ns.sleep(sleepTime);
    }
    
	//if(ns !== null) ns.tprint(`Nothing merged. Reducing step size.`);
	//await recursiveMergeStock(outputList, pairsToMerge, maxStepSize - 1, maxTrades, ns, maxDepth - 1);
	outputList.push(pairsToMerge.slice());
}

async function calculateStock(maxTrades, stockPrices, ns = null)
{
    if(ns !== null) await ns.sleep(1);
    
	var stockPairs = [];
	
	var highIndex = stockPrices.length - 1;
	var highPrice = stockPrices[highIndex];
	
	if(ns !== null)
	{
		//ns.tprint(`maxTrades: ${maxTrades}`);
		//ns.tprint(`   stocks: ${stockPrices}`);
	}
	
	// stockPairs.unshift(); to add to the front
	var prevPrice = highPrice;
	for(var i = stockPrices.length - 2; i >= 0; i--)
	{
		var price = stockPrices[i];
		
		if(highIndex == -1 || highPrice == -1)
		{
			highIndex = i;
			highPrice = price;
		}
		else if(price > prevPrice)
		{
			if(i + 1 != highIndex)
			{
				stockPairs.unshift([prevPrice, highPrice]);
			}
				
			highIndex = i;
			highPrice = price;
		}
		else if(i === 0)
		{
			stockPairs.unshift([price, highPrice]);
		}
		
		prevPrice = price;
	}
	
	if(stockPairs.length === 0)
		return 0;
	
	if(ns !== null)
	{
		var stockPairString = "";
		for(var i = 0; i < stockPairs.length; i++)
		{
			if(i !== 0) stockPairString += ",";
			stockPairString += `[${stockPairs[i]}]`;
		}
		//ns.tprint(`stockPairString: ${stockPairString}`);
	}
	
	if(maxTrades <= 0)
	{
		maxTrades = stockPairs.length;
	}
	
	var outList = [];
	
	//if(ns !== null) ns.tprint(`Starting recursiveMergeStock`);
	
	// function recursiveMergeStock(outputList, pairsToMerge, maxStepSize, maxTrades, ns = null)
	await recursiveMergeStock(outList, stockPairs, stockPairs.length, maxTrades, ns, 40);
	
	//if(ns !== null) ns.tprint(`recursiveMergeStock done`);
	
	outList.sort((a,b)=>{
		return totalValueOfPairs(b, maxTrades) - totalValueOfPairs(a, maxTrades);
	});
	
	var profit = 0;
	
	var finalStockPairs = outList[0];
	
	if(ns !== null)
	{
		var stockPairString = "";
		for(var i = 0; i < finalStockPairs.length; i++)
		{
			if(i !== 0) stockPairString += ",";
			stockPairString += `[${finalStockPairs[i]}]`;
		}
	}
	
	profit = totalValueOfPairs(finalStockPairs, maxTrades);
	
	return profit;
}

// stock trading, single transactions
export async function algorithmicStockI(data, ns = null) 
{
	return await calculateStock(1, data, ns);
}

// stock trading, no limit on transactions
export async function algorithmicStockII(data, ns = null) 
{
    // example: 129,25,109,86,19,7,199,21,27,173,83,133
    // ans: 478
    
	return await calculateStock(0, data, ns);
}

// stock trading, up to 2 transactions
export async function algorithmicStockIII(data, ns = null) 
{
	return await calculateStock(2, data, ns); 
}

// stock trading, up to k transactions. data[0]==k, data[1]==stockPriceArray
export async function algorithmicStockIV(data, ns = null)
{
	return await calculateStock(data[0], data[1], ns); 
}