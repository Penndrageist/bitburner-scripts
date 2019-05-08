export async function lpf(a, ns = null)
{
    let b = 2;
    while (a > b)
    {
        if (a % b === 0)
        {
            a = a / b;
            b = 2;
        }
        else
        {
            b += 1;
        }
    }
    
    return b;
}

export async function sumSubarrays(arr, ns = null)
{
    var sumMax = arr[0];
    
    for(var i = 0; i < arr.length; i++)
    {
        if(ns !== null) await ns.sleep(1);
        
        sumMax = Math.max(sumMax, arr[i]);
        
        var runningTotal = arr[i];
        for(var j = i + 1; j < arr.length; j++)
        {
            runningTotal += arr[j];
            sumMax = Math.max(sumMax, runningTotal);
        }
    }
    
    return sumMax;
}

export async function spiralise(grid, ns = null)
{
    var yDim = grid.length;
    
    if(yDim === 1) return grid[0];
    
    var xDim = grid[0].length;
    var output = [];
    
    var xMin = 0; 
    var xMax = xDim - 1;
    var x = 0;
    var xDir = 1;
    
    var yMin = 1; 
    var yMax = yDim - 1;
    var y = 0;
    var yDir = 0;
    
    while(output.length < xDim * yDim)
    {
        if(ns !== null) await ns.sleep(1);
        
        output.push(grid[y][x]);
        
        x += xDir;
        y += yDir;
        
        if(x >= xMax && xDir == 1 && yDir === 0)
        {
			x = xMax;
            xDir = 0;
            yDir = 1;
            xMax--;
        }
        else if(x <= xMin && xDir == -1 && yDir === 0)
        {
			x = xMin;
            xDir = 0;
            yDir = -1;
            xMin++;
        }
        else if(y >= yMax && xDir === 0 && yDir == 1)
        {
			y = yMax;
            xDir = -1;
            yDir = 0;
            yMax--;
        }
        else if(y <= yMin && xDir === 0 && yDir == -1)
        {
			y = yMin;
            xDir = 1;
            yDir = 0;
            yMin++;
        }
    }
    
    return output;
} 

async function recurseJump(data, index, ns = null)
{
    if(ns !== null) await ns.sleep(1);
    
	// can't check passed the end of the array
	// but if the input value exceed the array length, we must've made it
	if(index >= data.length) 
		return 1;
	
	// if we're exactly at the end of the array
	// we've made it
	if(index == data.length - 1)
		return 1;
	
	// we're not at the end of the array, but this position is 0
	// and so we can't jump further from here
	if(data[index] === 0) 
		return 0;

	// check each jumped forward position, up to the extent of
	// the current cell's value ahead of the current cell
	for(var i = index + 1; i < index + data[index]; i++)
	{
		// if we find a path, we've made it
		// no need to check others, so just return
		if(recurseJump(data, i) == 1)
			return 1;
	}
	
	return 0;
}

export async function arrayJumping(data, ns = null) 
{
	return await recurseJump(data, 0, ns);
}

export async function mergeIntervals(data, ns = null) 
{ 
    if(ns !== null) await ns.sleep(1);
    
	data.sort((a,b) => { return a[0]-b[0]; });
	
	var didMerge = false;
	
	for(var i = 0; i < data.length - 1 && !didMerge; i++)
	{
		var intervalL = data[i];
		var intervalR = data[i+1];
		
		if((intervalL[0] <= intervalR[0] && intervalR[0] <= intervalL[1])
			)
		{
			//ns.tprint(`Merging intervals: [${interval}] && [${workingInterval}]`);
			
			var newInterval = [
				Math.min(intervalL[0], intervalR[0]),
				Math.max(intervalL[1], intervalR[1])
			];
			
			data.splice(i, 2, newInterval);
			
			didMerge = true;
			break;
		}
	}
	
    return didMerge ? mergeIntervals(data, ns) : data;
}