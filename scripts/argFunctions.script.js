function GetFlag(args, flag)
{
	return args.includes(flag);
}

function GetArg(args, arg)
{
	for(var i = 0; i < args.length - 1; i++)
	{
		if(args[i] == arg)
		{
			return args[i+1];
		}
	}
	
	return null;
}