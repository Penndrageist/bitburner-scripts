function validateAddress(address, ns = null)
{
    // "17+45*7-18"
    var numbers = address.split(".");
	
	if(numbers.length != 4) 
	{
	    return false;
	}
    
	for(var i = 0; i < numbers.length; i++)
	{
		var octet = numbers[i];
		
		if(octet.length > 1 && octet[0] == "0")
		{
			return false;
		}
		
		var octetAsNum = Number(octet);
		
		if(octetAsNum < 0) return false;
		if(octetAsNum > 255) return false;
	}

    return true;
}

async function generateAddresses(list, buildingExpr, remainingStr, ns = null)
{
    if(ns !== null) await ns.sleep(1);
    
    if(remainingStr === undefined || remainingStr === null) remainingStr = "";
    
    buildingExpr += "";
    remainingStr += "";
    
    if(remainingStr.length === 0)
    {
        var processed = validateAddress(buildingExpr, ns);
        
        if(processed)
        {
            list.push(buildingExpr);
        }
        
        return;
    }
    
    var remString = remainingStr.substring(1);
    if(remString === undefined || remString === null)
        remString = "";
    
    await generateAddresses(list, buildingExpr.concat(remainingStr[0]), remString, ns);
    await generateAddresses(list, buildingExpr.concat(".",remainingStr[0]), remString, ns);
}

export async function generateIPs(data, ns = null) 
{
    /*
        Examples:
        25525511135 -> [255.255.11.135, 255.255.111.35]
        1938718066 -> [193.87.180.66]
    */
    var list = [];
    
    await generateAddresses(list, data[0], data.substring(1), ns);

	if(list.length === 0)
		list = [""];

    return list;
}