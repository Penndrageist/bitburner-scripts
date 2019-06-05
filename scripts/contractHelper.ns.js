import {GetAllServers_KnownStatic_Unsorted} from "nsFunctions.ns";

import {uniqueGridPathsI,uniqueGridPathsII} from "contractSolutions_grid.ns";

import {
    algorithmicStockI,
    algorithmicStockII,
    algorithmicStockIII,
    algorithmicStockIV
} from "contractSolutions_stock.ns";

import {integerPartition} from "contractSolutions_partition.ns";

import {
    lpf,
    sumSubarrays,
    spiralise,
    arrayJumping,
    mergeIntervals
} from "contractSolutions_simple.ns";

import {
    minimumPathSumTriangle,
    sanitizeParentheses
} from "contractSolutions_complex.ns";

import {
    findAllValidMathExpressions
} from "contractSolutions_mathExpr.ns";

import {
    generateIPs
} from "contractSolutions_ipGen.ns";


export class Contract
{   
    constructor(ns, contractName, serverLocation)
    {
        this.ns = ns;
        this.contractName = contractName;
        this.serverLocation = serverLocation;

        this.type = this.ns.codingcontract.getContractType(this.contractName, this.serverLocation);
        this.data = this.ns.codingcontract.getData(this.contractName, this.serverLocation);
        this.remainingAttempts = this.ns.codingcontract.getNumTriesRemaining(this.contractName, this.serverLocation);
    }
}

Contract.prototype.printData = function()
{
	this.ns.print(`Contract: ${this.contractName}`);
    this.ns.print(`Server: ${this.serverLocation}`);
	this.ns.print(`Type: ${this.type}`);
	this.ns.print(`Data: ${this.data}`);
	this.ns.print(`Attempts: ${this.remainingAttempts}`);
	this.ns.print(`---------------------------------------`);
}

Contract.prototype.requestManualVerify = function(answer)
{
	if(answer !== null) this.ns.tprint(`${this.contractName} on ${this.serverLocation} needs verification.\n\tData: ${this.data}\n\tPossible Answer: ${answer}`);
}

Contract.prototype.Answer = async function()
{
	var answer = null;
	switch(this.type)
	{
		case "Find Largest Prime Factor":
			answer = await lpf(this.data, this.ns);
			break;
		case "Subarray with Maximum Sum":
			answer = await sumSubarrays(this.data, this.ns);
			break;
		case "Total Ways to Sum":
			answer = await integerPartition(this.data, this.ns) - 1;
			break;
		case "Spiralize Matrix":
			answer = await spiralise(this.data, this.ns);
			break;
		case "Array Jumping Game":
			answer = await arrayJumping(this.data, this.ns);
			break;
		case "Merge Overlapping Intervals":
			answer = await mergeIntervals(this.data, this.ns);
			break;
		case "Generate IP Addresses":
			answer = await generateIPs(this.data, this.ns);
			break;
		case "Algorithmic Stock Trader I":
			answer = await algorithmicStockI(this.data, this.ns);
			break;
		case "Algorithmic Stock Trader II":
			answer = await algorithmicStockII(this.data, this.ns);
			break;
		case "Algorithmic Stock Trader III":
			answer = await algorithmicStockIII(this.data, this.ns);
			break;
		case "Algorithmic Stock Trader IV":
			answer = await algorithmicStockIV(this.data, this.ns);
			break;
		case "Minimum Path Sum in a Triangle":
			answer = await minimumPathSumTriangle(this.data, this.ns);
			break;
		case "Unique Paths in a Grid I":
			answer = await uniqueGridPathsI(this.data, this.ns);
			break;
		case "Unique Paths in a Grid II":
			answer = await uniqueGridPathsII(this.data, this.ns);
			break;
		case "Sanitize Parentheses in Expression":
			answer = await sanitizeParentheses(this.data, this.ns);
			break;
		case "Find All Valid Math Expressions":
			answer = await findAllValidMathExpressions(this.data, this.ns);
	}
	
	return answer;
}

Contract.prototype.Attempt = async function(printToConsole)
{
    Log(this.ns, `Attempting answer for ${this.contractName} on ${this.serverLocation} -> ${this.type}`, true /*printToConsole*/);
	
    var answer = await this.Answer();
	let str = "";
	if(this.remainingAttempts <= 2)// && this.type !== "Array Jumping Game")
	{
	    Log(this.ns, `Not automatically attempting ${this.contractName} on ${this.serverLocation}.\n${this.remainingAttempts} remaining.\nPossible Answer: ${answer}`, printToConsole);
		return;
	}
	
	if(answer !== null)
	{
		Log(this.ns, `${this.contractName} -> ${this.type}: ${answer} => given: ${this.data}`, true/*printToConsole*/);
		this.ns.codingcontract.attempt(answer, this.contractName, this.serverLocation);
	}
	else
	{
		//Log(this.ns, `${this.contractName} -> ${this.type}: No solution.`, printToConsole);
	}
	this.ns.print(`=======================================`);
}

function Log(ns, output, toConsole)
{
    if(toConsole)
    {
        ns.tprint(output);
    }
    else
    {
        ns.print(output);
    }
}

export function GetContracts(ns)
{
	var allServers = GetAllServers_KnownStatic_Unsorted();
	
	if(ns.getCharacterInformation().tor) allServers.push("darkweb");
	
    allServers.push("home");
	
    var contracts = [];

	for(var i in allServers)
	{
		var server = allServers[i];
		
		var files = ns.ls(server, ".cct");
		
		for(var f in files)
		{
			contracts.push(new Contract(ns, files[f], server));
		}
	}
	
	return contracts;
}

export async function ProcessAll(ns, printToConsole=false)
{
	var cPairs = GetContracts(ns);
	
	for (var i in cPairs)
	{
		var contract = cPairs[i];
		
		//contract.printData();
		await contract.Attempt(printToConsole);
	}
}