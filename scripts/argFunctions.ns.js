export function GetFlag(ns, flag)
{
	return ns.args.includes(flag);
}

export function GetArg(ns, arg, def = null)
{
	for(var i = 0; i < ns.args.length - 1; i++)
	{
		if(ns.args[i] == arg)
		{
			return ns.args[i+1];
		}
	}
	
	return def;
}

export function GetIndex(ns, arg)
{
	for(var i = 0; i < ns.args.length; i++)
	{
		if(ns.args[i] == arg)
		{
			return i;
		}
	}
	
	return -1;
}