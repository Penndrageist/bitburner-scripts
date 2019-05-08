import {GetFlag} from "argFunctions.ns";
import {GetArg} from "argFunctions.ns";


export async function main(ns)
{
    var helpArg = GetArg(ns, "--help");
    ns.tprint(helpArg !== null ? helpArg : "null");
    
    ns.tprint(GetFlag(ns, "--on"));
    
    await ns.sleep(1);
}