import { PatientForAllocation, BedForAllocation, OptimizerOutput, AllocationResult } from './types';
import { checkHardConstraints } from './constraints';

/**
 * Assigns beds to patients using a greedy approach.
 * Sorts patients by priority and picks the best feasible bed for each.
 * 
 * @param patients List of patients to allocate.
 * @param beds List of available beds.
 * @param icuReserve Number of ICU beds to reserve.
 * @returns OptimizerOutput with greedy allocations.
 */
export function runGreedyAllocation(
  patients: PatientForAllocation[],
  beds: BedForAllocation[],
  icuReserve: number = 2
): OptimizerOutput {
  const sortedPatients = [...patients].sort((a, b) => b.priorityScore - a.priorityScore);
  const availableBeds = [...beds];
  
  const allocations: AllocationResult[] = [];
  const unassigned: string[] = [];
  let totalCost = 0;

  for (const patient of sortedPatients) {
    let bestBed: BedForAllocation | null = null;
    let bestScore = -Infinity;
    let bestExplanation = '';

    for (const bed of availableBeds) {
      const constraintCheck = checkHardConstraints(patient, bed);
      if (!constraintCheck.feasible) continue;

      let score = 0;
      let explanationParts = [];

      const extraEquipment = bed.equipment.filter(eq => !patient.requiredEquipment.includes(eq));
      score += extraEquipment.length * 10;
      if (extraEquipment.length > 0) {
        explanationParts.push('has extra equipment');
      }

      if (bed.isIsolation === patient.isolationNeed) {
        score += 5;
        explanationParts.push('isolation status matches');
      }

      if (bed.wardType === 'ICU') {
        const icuBedsAvailable = availableBeds.filter(b => b.wardType === 'ICU').length;
        if (icuBedsAvailable <= icuReserve) {
          score -= 20;
          explanationParts.push('ICU reserve penalty applied');
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestBed = bed;
        bestExplanation = `Selected bed ${bed.code} because ` + explanationParts.join(', ') + '.';
      }
    }

    if (bestBed) {
      allocations.push({
        patientId: patient.id,
        bedId: bestBed.id,
        bedCode: bestBed.code,
        score: bestScore,
        explanation: bestExplanation || `Selected bed ${bestBed.code} as best available match.`,
        method: 'GREEDY'
      });
      totalCost += (100 - patient.priorityScore) - bestScore;
      
      const bedIndex = availableBeds.findIndex(b => b.id === bestBed!.id);
      availableBeds.splice(bedIndex, 1);
    } else {
      unassigned.push(patient.id);
      totalCost += 1000; 
    }
  }

  return {
    allocations,
    unassigned,
    totalCost,
    method: 'GREEDY'
  };
}
