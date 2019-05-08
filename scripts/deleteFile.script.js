if(args.length === 0) exit;

for(i = 0; i < args.length; i++)
{
    print('Deleting: ' + args[i] + ' from '+ getHostname());
    rm(args[i]);
}