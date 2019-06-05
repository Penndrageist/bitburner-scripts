import {GetFlag, GetArg} from "argFunctions.ns";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// 30 possible gang members
// create list of names
let memberNamePool = [
    "Thor", // 1
    "Iron Man", // 2
    "Starlord", // 3
    "Thanos", // 4
    "Groot", // 5
    "Ant-Man", // 6
    "Wasp", // 7
    "Spiderman", // 8
    "Loki", // 9
    "Gamora", // 10
    "Rocket Raccoon", // 11
    "T'Challa", // 12
    "Vision", // 13
    "Scarlet Witch", // 14
    "Winter Soldier", // 15
    "Black Widow", // 16
    "Hulk", // 17
    "Bruce Banner", // 18
    "Hawkeye", // 19
    "Captain Marvel", // 20
    "War Machine", // 21
    "Nick Fury", // 22
    "Nebula", // 23
    "Drax", // 24
    "Deadpool", // 25
    "Cable", // 26
    "Quicksilver", // 27
    "Wolverine", // 28
    "Adam Warlock", // 29
    "Yondu", // 30
];

export async function main(ns)
{
	var balanceTasks = !GetFlag(ns, "--focused");
	var minCombatWinLevel = Math.min(GetArg(ns, "-c", 0.6), 1.0);
	
	var buyAll = GetFlag(ns, "--buyAll");
	
	var buyEquip = buyAll || GetFlag(ns, "--buyEquip");
	
	var buyWeapon = buyAll || buyEquip || GetFlag(ns, "--buyWeapon");
	var buyArmor = buyAll || buyEquip || GetFlag(ns, "--buyArmor");
	var buyVehicle = buyAll || buyEquip || GetFlag(ns, "--buyVehicle");
	var buyRoot = buyAll || buyEquip ||  GetFlag(ns, "--buyRoot");
	
	var buyAug = buyAll || GetFlag(ns, "--buyAug");
	
	var myGang = ns.gang.getGangInformation();
    var possibleTasks = ns.gang.getTaskNames();
    var unassignedTask = possibleTasks.shift();
	
	var territoryTask = possibleTasks.pop();
    var trainingTasks = possibleTasks.splice(possibleTasks.length-3, 3);
    var wantedLevelLowerTask = possibleTasks.pop();
	
	var desirableAugs = [];
	
	if(myGang.isHacking)
	{
		wantedLevelLowerTask = possibleTasks.pop();
		
		// replace combat with hacking
		trainingTasks.splice(0,1, trainingTasks[1]);
		
		desirableAugs.push("BitWire");
		desirableAugs.push("Neuralstimulator");
		desirableAugs.push("DataJack");
	}
	else
	{
		// replace hacking with combat
		trainingTasks.splice(1,1, trainingTasks[0]);
		
		desirableAugs.push("Bionic Arms");
		desirableAugs.push("Bionic Legs");
		desirableAugs.push("Bionic Spine");
		desirableAugs.push("BrachiBlades");
		desirableAugs.push("Nanofiber Weave");
		desirableAugs.push("Synthetic Heart");
		desirableAugs.push("Synfibril Muscle");
		desirableAugs.push("Graphene Bone Lacings");
	}
    
	
    var ascensionCycles = GetArg(ns, "--asc", 600000);
	var nextAscensionAttempt = 0;
	var cycleMs = 2100;
	var ascensionMultLimit = GetArg(ns, "--alim", 2);
	
	ns.print(`unassignedTask: ${unassignedTask}`);
	ns.print(`territoryTask: ${territoryTask}`);
	ns.print(`trainingTasks: ${trainingTasks}`);
	ns.print(`possibleTasks: ${possibleTasks}`);
	ns.print(`wantedLevelLowerTask: ${wantedLevelLowerTask}`);
	
	await ns.sleep(10000);
	
	var otherGangs = ns.gang.getOtherGangInformation();
	var otherGangNames = [];
	for(var gangName in otherGangs)
	{
		otherGangNames.push(gangName);
		//ns.tprint(gangName);
	}
	
    while(true)
    {
        myGang = ns.gang.getGangInformation();
        var otherGangs = ns.gang.getOtherGangInformation();
		var buyableEquipment = ns.gang.getEquipmentNames().filter(e => {
			return ns.gang.getEquipmentType(e) != "Augmentation" || desirableAugs.includes(e);
		});
        
        if(myGang.isHacking)
        {
            ns.gang.setTerritoryWarfare(false);
        }
		else
		{
            ns.gang.setTerritoryWarfare(otherGangNames.every(name => ns.gang.getChanceToWinClash(name) > minCombatWinLevel));
		}
        
        var members = ns.gang.getMemberNames();

        while(ns.gang.canRecruitMember())
        {
            var possibleNames = memberNamePool.filter(name => !members.includes(name));
            var toRecruit = possibleNames[getRandomInt(possibleNames.length)];
            
            ns.gang.recruitMember(toRecruit);
            await ns.sleep(1);
        }
        
        members = ns.gang.getMemberNames();
        var memInfo = null;
		
        members.sort((a,b)=> { return Math.random()*2-1; } );
		members.forEach( (m) => { 
			var didBuy = false;
			var hadAll = true;
		
            memInfo = ns.gang.getMemberInformation(m);
			
			ns.gang.setMemberTask(m, unassignedTask);
			
			buyableEquipment.forEach( (e) => 
			{
				if(memInfo.equipment.includes(e)) return;
				if(memInfo.augmentations.includes(e)) return;
				
				hadAll = false;
				
				var type = ns.gang.getEquipmentType(e);
				switch(type)
				{
					case "Weapon":
						if(buyWeapon)
						{
							didBuy |= ns.gang.purchaseEquipment(m, e);
						}
						break;
					case "Armor":
						if(buyArmor)
						{
							didBuy |= ns.gang.purchaseEquipment(m, e);
						}
						break;
					case "Vehicle":
						if(buyVehicle)
						{
							didBuy |= ns.gang.purchaseEquipment(m, e);
						}
						break;
					case "Rootkit":
						if(buyRoot)
						{
							didBuy |= ns.gang.purchaseEquipment(m, e);
						}
						break;
					case "Augmentation":
						if(buyAug)
						{
							didBuy |= ns.gang.purchaseEquipment(m, e);
						}
						break;
					default:
						break;
				}
			});
			
			var wantsToAscend = hadAll;
			
			if(myGang.isHacking)
			{
				wantsToAscend &= memInfo.hackingAscensionMult < ascensionMultLimit;
			}
			else
			{
				wantsToAscend &= memInfo.hackingAscensionMult < ascensionMultLimit;
				wantsToAscend &= memInfo.strengthAscensionMult < ascensionMultLimit;
				wantsToAscend &= memInfo.agilityAscensionMult < ascensionMultLimit;
				wantsToAscend &= memInfo.dexterityAscensionMult < ascensionMultLimit;
			}
			
			if(wantsToAscend && nextAscensionAttempt <= 0)
			{
				ns.gang.ascendMember(m);
			}
		});
		
        if(nextAscensionAttempt <= 0)
		{
			nextAscensionAttempt = ascensionCycles;
		}
			
        var member = "";
		if(!myGang.isHacking)
		{
            var memCount = members.length;
            
            while(members.length > Math.floor(memCount / 2))
            {
                member = members.pop();
                ns.gang.setMemberTask(member, territoryTask);
            }
		}
        
        while(members.length > 0)
        {
            var task = "";
            member = members.pop();
            memInfo = ns.gang.getMemberInformation(member);
			
            var statsTarget = 50;
            
			myGang = ns.gang.getGangInformation();
			
			var reduceWanted;
            
            reduceWanted = myGang.wantedLevel > 1;
			if(balanceTasks)
			{
                reduceWanted |= myGang.wantedLevelGainRate > 0;
			}
			
            if((myGang.isHacking && memInfo.hacking < statsTarget) ||
              (!myGang.isHacking && memInfo.strength < statsTarget && memInfo.agility < statsTarget && memInfo.charisma < statsTarget && memInfo.defense < statsTarget))
            {
                task = trainingTasks[getRandomInt(trainingTasks.length)];
            }
            else if(reduceWanted)
            {
                task = wantedLevelLowerTask;
            }
            else
            {
                task = possibleTasks[getRandomInt(possibleTasks.length) - 1];
            }

            ns.gang.setMemberTask(member, task);
        }

        await ns.sleep(cycleMs);
		nextAscensionAttempt -= cycleMs;
    }
}