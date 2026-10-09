/**
 * Calculates a priority score for a patient based on clinical factors.
 * Higher score means higher priority.
 * 
 * @param patient The patient parameters.
 * @returns The calculated priority score.
 */
export function calculatePriorityScore(patient: {
  triageLevel: number;
  age: number;
  waitingMinutes: number;
  flags: { isPediatric?: boolean; isPregnant?: boolean; isInfectionRisk?: boolean };
}): number {
  if (patient.triageLevel === 1) {
    return 1000;
  }

  let triageWeight = 0;
  if (patient.triageLevel === 2) triageWeight = 80;
  else if (patient.triageLevel === 3) triageWeight = 60;
  else if (patient.triageLevel === 4) triageWeight = 40;
  else if (patient.triageLevel === 5) triageWeight = 20;

  const agingFactor = Math.min(patient.waitingMinutes * 0.5, 30);
  
  let flagBonus = 0;
  if (patient.flags.isPediatric || patient.age < 14) flagBonus += 5;
  if (patient.flags.isPregnant) flagBonus += 5;
  if (patient.flags.isInfectionRisk) flagBonus += 3;

  return triageWeight + agingFactor + flagBonus;
}

/**
 * Estimates wait time based on queue position and recent history.
 * 
 * @param positionInQueue The current position of the patient in the queue.
 * @param recentServiceTimes Array of recent service times in minutes.
 * @returns Estimated wait time in minutes.
 */
export function estimateWaitTime(positionInQueue: number, recentServiceTimes: number[]): number {
  if (!recentServiceTimes || recentServiceTimes.length === 0) {
    return positionInQueue * 15;
  }

  const last20 = recentServiceTimes.slice(-20);
  const sum = last20.reduce((acc, val) => acc + val, 0);
  const average = sum / last20.length;

  return positionInQueue * average;
}
