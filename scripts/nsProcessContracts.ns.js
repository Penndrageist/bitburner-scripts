import * as contractHelper from "contractHelper.ns";

export async function main(ns)
{
    ns.disableLog("sleep");
	await contractHelper.ProcessAll(ns, true);
}