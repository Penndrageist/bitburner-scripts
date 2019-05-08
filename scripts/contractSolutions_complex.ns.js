/*
[
            [3],
           [2,8],
          [7,6,7],
         [7,4,7,8],
        [5,3,5,7,6],
       [8,4,9,4,2,3],
      [1,3,3,5,7,8,7],
     [1,8,9,9,5,7,3,9],
    [4,7,2,8,8,3,4,8,3],
   [9,3,9,3,7,7,2,1,2,8],
  [4,8,2,8,4,1,1,8,2,2,9]
]
*/
async function recurseSumTriangle(data, sumsList, level, index, runningTotal, ns, pathString = "")
{
    if(ns !== null) await ns.sleep(1);
    
	runningTotal += data[level][index];
	pathString = pathString.concat(`${pathString.length === 0 ? "":"+"}${data[level][index]}`);
	
	if(level == data.length - 1)
	{
		sumsList.push([runningTotal,pathString]);
		return;
	}
	
	await recurseSumTriangle(data, sumsList, level+1, index, runningTotal, ns, pathString);
	await recurseSumTriangle(data, sumsList, level+1, index+1, runningTotal, ns, pathString);
}

export async function minimumPathSumTriangle(data, ns = null)
{ 
	var sums = [];
	
	await recurseSumTriangle(data, sums, 0, 0, 0, ns);
	sums.sort((a,b)=>{return a[0]-b[0];});
	
	// TODO: Return only smallest sum
	return sums[0][0];
}

async function ValidateParentheses(parString, ns)
{
	var parathesisStack = [];
	var openPar = '(';
	var closePar = ')';
	var a = 'a';
	
	for(var i = 0; i < parString.length; i++)
	{
        if(ns !== null) await ns.sleep(1);
        
		if(parString[i] == a) continue;
		
		if(parString[i] == openPar)
		{
			parathesisStack.push(openPar);
		}
		else if(parString[i] == closePar)
		{
			// cannot close if nothing has opened
			if(parathesisStack.length === 0)
			{
				return false;
			}
			else if(parathesisStack[parathesisStack.length - 1] == openPar)
			{
				parathesisStack.pop();
			}
			else
			{
				// something wrong
				return false;
			}
		}
		else
		{
			// something wrong
			return false;
		}
	}
	
	return parathesisStack.length === 0;
}

async function recurseRemoveCharacters(inputString, charsToRemove, workingList, ns = null)
{
    if(ns != null) await ns.sleep(1);
    
	if(charsToRemove === 0)
	{
	    if(!workingList.includes(inputString))
        {
            var isValid = await ValidateParentheses(inputString, ns);
            
            if(isValid)
		    {
                workingList.push(inputString);
            }
        }
		    
		return;
	}
	
	for(var i = 0; i < inputString.length; i++)
	{
		if(inputString[i] == 'a') 
		{
			// only remove parentheses
			continue;
		}
		
		var remString = inputString.substring(0,i) + inputString.substring(i+1, inputString.length);
		
		await recurseRemoveCharacters(
			remString,
			charsToRemove - 1,
			workingList,
            ns
		);
	}
}

export async function sanitizeParentheses(data, ns = null) 
{
	var validStrings = [];
	
	for(var i = 0; i < data.length && validStrings.length === 0; i++)
	{
	    var workingStrings = [];
		
		await recurseRemoveCharacters(data, i, workingStrings, ns);
		
		validStrings = workingStrings;
	}
	
	// might be impossible to validate
	if(validStrings.length === 0)
		validStrings = [""];
	
	return validStrings;
}