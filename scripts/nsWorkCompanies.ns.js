import {GetFlag} from "argFunctions.ns";
import {GetArg} from "argFunctions.ns";
import * as sActFuncs from "singularityActions.js";

var allJobTitles = 
[
	"Business", // to become CFO/CEO
	"Agent",
	"Security",
	"Software", // to become CTO
	"Security Engineer", // to become CTO
	"Network Engineer", // to become CTO
	"IT",
	"Software Consultant",
	"Business Consultant",
];

function CorporationJob(ns, compName)
{
	this.ns = ns;
	this.companyName = compName;
	
	this.availableJobs = allJobTitles;
	
	this.currentJobName = null;
	this.currentJobIndex = allJobTitles.length - 1;
}

CorporationJob.prototype.Apply = function()
{
	var jobSuccess = false;
	
	for(var jt = 0; jt <= this.currentJobIndex; jt++)
	{
		if(this.ns.applyToCompany(this.companyName, this.availableJobs[jt]))
		{
			this.currentJobIndex = jt;
			this.currentJobName = this.availableJobs[jt];
			break;
		}
	}
};

CorporationJob.prototype.IsEmployed = function()
{
	return this.ns.getCharacterInformation().jobs.includes(this.companyName);
};

CorporationJob.prototype.GetRep = function()
{
	return this.ns.getCompanyRep(this.companyName);
};

CorporationJob.prototype.WantToWork = function()
{
	return this.IsEmployed() && (this.GetRep() < 200000 || !this.ns.getCharacterInformation().factions.includes(this.companyName));
};

CorporationJob.prototype.Work = function()
{
    var currentAction = sActFuncs.currentAction(this.ns);
	if(this.ns.isBusy() && currentAction.type != sActFuncs.companyAction()) return false;
	
	return sActFuncs.workForCompany(this.ns, this.companyName);
};

export async function main(ns)
{
    //ns.disableLog("ALL");
    
	var sleepTime = GetArg(ns, "-s", 60000);
	
	var companies = 
	[
		// Sector-12
		"MegaCorp",
		"Blade Industries",
		"Four Sigma",
		
		// Chongqing
		"KuaiGong International",
		
		// Volhaven
		"NWO",
		
		// Volhaven
		"OmniTek Incorporated",
		
		// Aevum
		"ECorp",
		"Bachman & Associates",
		"Clarke Incorporated",
		"Fulcrum Technologies",
	];
	
	let allJobs = [];
	
	for(let nj = 0; nj < companies.length; nj++)
	{
        var newJob = new CorporationJob(
	        ns,
	        companies[nj]
        );
             
		allJobs.push(newJob);
	}
	
	await ns.sleep(sleepTime);
	
	var maxDesiredRep = 200000;//250000;
	var charInfo = ns.getCharacterInformation();
	
	while(true)
	{
		for(var j1 = 0; j1 < allJobs.length; j1++)
		{   
			allJobs[j1].Apply();
		}
		
		var jobToWork = null;
		for(var j2 = 0; j2 < allJobs.length; j2++)
		{
			if(allJobs[j2].WantToWork())
			{
				jobToWork = allJobs[j2];
				break;
			}
		}
		
		ns.print("Currently want to work for: " + (jobToWork !== null ? jobToWork.companyName : "No one"));
		
		if(jobToWork !== null)
		{
			while(ns.isBusy()) 
			{
				await ns.sleep(sleepTime);
			}
			
			while(true)
			{
				jobToWork.Apply();
				if(!jobToWork.Work()) break;
				
				if(ns.isBusy())
				{
					charInfo = ns.getCharacterInformation();
					
				    var currentEffectiveRep = jobToWork.GetRep();
					currentEffectiveRep += charInfo.workRepGain * 0.5;
					
					if(currentEffectiveRep >= maxDesiredRep)
					{
						ns.print("Done working for " + jobToWork.companyName + "!!");
						ns.stopAction();
						break;
					}
					else
					{
						ns.print("Working. Be brain-dead.");
						await ns.sleep(sleepTime);
					}
				}
				else
				{
					await ns.sleep(sleepTime);
				}
				
				// work for the first faction that has stuff that I want
				if(jobToWork.GetRep() >= maxDesiredRep)
				{
					ns.print("Working. Be brain-dead.");
					break;
				}
				
				await ns.sleep(1);
			}
		}
	
		await ns.sleep(sleepTime);
	}
}