export async function main(ns)
{
	var numSleeves = ns.sleeve.getNumSleeves();
	for(var i = 0; i < numSleeves; i++)
	{
		ns.sleeve.setToShockRecovery(i);
	}
}