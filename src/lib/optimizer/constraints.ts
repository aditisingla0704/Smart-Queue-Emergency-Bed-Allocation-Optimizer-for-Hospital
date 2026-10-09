import { PatientForAllocation, BedForAllocation } from './types';

/**
 * Checks hard constraints between a patient and a bed.
 * Returns whether the assignment is feasible and a list of reasons if not.
 * 
 * @param patient The patient being evaluated.
 * @param bed The bed being evaluated.
 * @returns Object with feasible boolean and array of reasons.
 */
export function checkHardConstraints(
  patient: PatientForAllocation,
  bed: BedForAllocation
): { feasible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (patient.wardTypeNeeded !== bed.wardType) {
    reasons.push(`Ward type mismatch. Required: ${patient.wardTypeNeeded}, Actual: ${bed.wardType}`);
  }

  if (patient.isolationNeed && !bed.isIsolation) {
    reasons.push('Patient requires isolation but bed is not isolation.');
  }

  const missingEquipment = patient.requiredEquipment.filter(eq => !bed.equipment.includes(eq));
  if (missingEquipment.length > 0) {
    reasons.push(`Missing required equipment: ${missingEquipment.join(', ')}`);
  }

  if (bed.genderPolicy === 'MALE_ONLY' && patient.sex !== 'MALE') {
    reasons.push('Bed is male only but patient is not male.');
  } else if (bed.genderPolicy === 'FEMALE_ONLY' && patient.sex !== 'FEMALE') {
    reasons.push('Bed is female only but patient is not female.');
  } else if (bed.genderPolicy === 'SAME_GENDER' && bed.currentGender && bed.currentGender !== patient.sex) {
    reasons.push(`Bed requires same gender (${bed.currentGender}) but patient is ${patient.sex}.`);
  }

  return {
    feasible: reasons.length === 0,
    reasons
  };
}
