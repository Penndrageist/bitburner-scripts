let ACTION_FILENAME = "singularityAction";
let ACTION_DELIM = ";";

export function currentAction(ns)
{
	if(!ns.isBusy()) return { type: "idle" };
	
	var actionString = ns.read(ACTION_FILENAME);
	
	if(actionString === "") return  { type: "idle" };
	
	var actionTokens = actionString.split(ACTION_DELIM);
	
	var actionObject = { type: actionTokens[0] };
	
	if(actionTokens.length >= 1)
		actionObject["primary"] = actionTokens[1];
	
	if(actionTokens.length >= 2)
		actionObject["secondary"] = actionTokens[1];
	
	return actionObject;
}

export function stopAction(ns)
{
	ns.stopAction();
	
	// empty the file
	ns.write(ACTION_FILENAME, "", "w");
}

let UNIVERSITY_ACTION = "universityCourse";
export function universityAction() { return UNIVERSITY_ACTION; }
export function universityCourse(ns, universityName, courseName)
{
	if(ns.universityCourse(universityName, courseName))
	{
		logAction(ns, UNIVERSITY_ACTION, universityName, courseName);
		return true;
	}
	
	return false;
}

let GYM_ACTION = "gymWorkout";
export function gymAction() { return GYM_ACTION; }
export function gymWorkout(ns, gymName, stat)
{
	if(ns.gymWorkout(gymName, stat))
	{
		logAction(ns, GYM_ACTION, gymName, stat);
		return true;
	}
	
	return false;
}

let COMPANY_ACTION = "workForCompany";
export function companyAction() { return COMPANY_ACTION; }
export function workForCompany(ns, companyName)
{
	if(ns.workForCompany(companyName))
	{
		logAction(ns, COMPANY_ACTION, companyName);
		return true;
	}
	
	return false;
}

let FACTION_ACTION = "workForFaction";
export function factionAction() { return FACTION_ACTION; }
export function workForFaction(ns, factionName, workType)
{
	if(ns.workForFaction(factionName, workType))
	{
		logAction(ns, FACTION_ACTION, factionName, workType);
		return true;
	}
	
	return false;
}

let PROGRAM_ACTION = "createProgram";
export function programAction() { return PROGRAM_ACTION; }
export function createProgram(ns, programName)
{
	if(ns.createProgram(programName))
	{
		logAction(ns, PROGRAM_ACTION, programName);
		return true;
	}
	
	return false;
}

let CRIME_ACTION = "commitCrime";
export function crimeAction() { return CRIME_ACTION; }
export function commitCrime(ns, crime)
{
	if(ns.commitCrime(crime))
	{
		logAction(ns, CRIME_ACTION, crime);
		return true;
	}
	
	return false;
}

function logAction(ns, actionType, actionDetailPrimary = "", actionDetailSecondary = "")
{
	ns.write(ACTION_FILENAME, actionType, "w");
	
	if(actionDetailPrimary !== "")
	{
		ns.write(ACTION_FILENAME, ACTION_DELIM, "a");
		ns.write(ACTION_FILENAME, actionDetailPrimary, "a");
	}
	
	if(actionDetailSecondary !== "")
	{
		ns.write(ACTION_FILENAME, ACTION_DELIM, "a");
		ns.write(ACTION_FILENAME, actionDetailSecondary, "a");
	}
}