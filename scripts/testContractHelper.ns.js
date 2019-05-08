import * as contractHelper from "contractHelper.ns";
import * as complex from "contractSolutions_complex.ns";
import * as simple from "contractSolutions_simple.ns";
import * as ipGen from "contractSolutions_ipGen.ns";
//import * as ipGen from "contractSolutions_ipGen.ns";
import * as stock from "contractSolutions_stock.ns";

let globalNs = null;

export async function main(ns)
{
    globalNs = ns;
    
	var server = "home";
	var cct = "contract-587007.cct";
	var data = null;
	
	
	data = ns.codingcontract.getData(cct, server);
	//data = [5, [84,67,190,73,144,65,54,160,130,24,22,101,9,26,14,38,76,69,140,134,117,164,9,150,168,4,106,56,11,28,106,101,178,35,17,102,129,114,56]];
	ns.tprint(await stock.algorithmicStockIV(data, ns));
	
	
	/*
	// Merge Overlapping Intervals
	// Data: [15,18],[2,6],[18,27],[9,13],[20,27],[20,21],[23,33],[21,22],[5,6],[4,6],[5,15],[2,11],[25,32],[4,6],[20,26],[2,3],[15,16],[4,11]
	server = "ecorp";
	cct = "contract-357596.cct";
	data = [[15,20],[10,18],[13,15],[9,16],[19,24],[14,23],[24,29],[22,23],[23,32],[17,19]];//ns.codingcontract.getData(cct, server);
	ns.tprint(simple.mergeIntervals(data, 20, ns));
	*/
    
    /*
	// Subarray with Maximum Sum
	// Data: 7,0,-5,8,6,8,-7,-5,3,9,-1,-1,-2,1,1,-8,-9,-9,4,-1,1,-3,0,9,-1,4,-3,-3,-6,8,10
	server = "alpha-ent";
	cct = "contract-45411.cct";
	data = ns.codingcontract.getData(cct, server);
	ns.tprint(simple.sumSubarrays(data, ns));
	*/
	
	/*
	// Generate IP Addresses
	// Data: 1552300192
	// Ans: 155.230.0.192
	server = ".";
	cct = "contract-746154.cct";
	data = "1552300192";//ns.codingcontract.getData(cct, server);
	ns.tprint(ipGen.generateIPs(data, ns));
	*/
}