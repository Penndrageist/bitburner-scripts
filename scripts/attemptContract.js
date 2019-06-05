import * as contractHelper from "contractHelper.ns";

export async function main(ns)
{
	if (ns.args.length != 2) return;
	
	var contract = new contractHelper.Contract(ns, ns.args[0], ns.args[1]);
	
	await contract.Attempt();
}