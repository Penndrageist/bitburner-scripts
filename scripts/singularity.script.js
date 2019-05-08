var busySleepTime = 500;

var factionArrays = [
    [], // faction names
    [], // max rep required
    [] // desired augments
];

// resetAtBuyableAugment = ["Red Pill"];

var scriptsToRun = [
    ["bot-net.script",""],
    //["buyCreatePrograms-Singularity.script",""],
    ["studyCompSci-Singularity.script",""],
    ["acceptFactions-Singularity.script",""],
];

var serverRAM = getServerRam("home")[0];

var ownedAugs = getOwnedAugmentations();
if(ownedAugs.includes("CashRoot Starter Kit"))
{
    var numServers = Math.ceil(ownedAugs.length / 15.0);
    scriptsToRun.push(["purchaseServer.script", numServers])

/*
    if(serverRAM >= 1024)
    {   
        run("hackNodes_init.script", 1, 20, 200, 4, 4);
    }
    else if(serverRAM >= 64)
    {
        run("hackNodes_init.script", 1, 10, 100, 2, 2);
    }
*/
}

for (var i = 0; i < scriptsToRun.length; i++) {
    if (!scriptRunning(scriptsToRun[i][0], "home"))
        while (!run(scriptsToRun[i][0], 1, scriptsToRun[i][1]))
            sleep(1000);
}

// work-Singularity.script

while (getServerRam("home")[0] < 4096) {
    // charInfo = getCharacterInformation();

    //ownedAugments = getOwnedAugmentations(true);

    if (!upgradeHomeRam())
        sleep(1000);
}

//spawn("terminate-singularity.script", 1);