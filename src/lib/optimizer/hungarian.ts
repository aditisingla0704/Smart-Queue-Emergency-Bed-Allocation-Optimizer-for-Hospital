import { PatientForAllocation, BedForAllocation, OptimizerOutput, AllocationResult } from './types';
import { checkHardConstraints } from './constraints';

const INFEASIBLE = 1e9;

/**
 * Computes the cost of assigning a patient to a bed.
 * Lower cost is better. Infeasible assignments get INFEASIBLE cost.
 *
 * Cost components:
 *   base       = (100 - priorityScore) so higher priority patients get lower cost
 *   waitPenalty = waitingMinutes * 0.5 (longer waits increase urgency)
 *   icuReserve = +50 if assigning to ICU and it would breach the reserve threshold
 *   equipBonus = -5 per extra piece of equipment on the bed beyond what is required
 *
 * @param patient The patient to assign.
 * @param bed The candidate bed.
 * @param icuBedCount Total ICU beds in the candidate pool.
 * @param icuReserve Minimum ICU beds to keep free.
 * @returns Numeric cost (lower is better).
 */
function computeCost(
  patient: PatientForAllocation,
  bed: BedForAllocation,
  icuBedCount: number,
  icuReserve: number
): number {
  const check = checkHardConstraints(patient, bed);
  if (!check.feasible) return INFEASIBLE;

  const baseCost = Math.max(0, 100 - patient.priorityScore);
  const waitPenalty = patient.waitingMinutes * 0.5;
  let reservePenalty = 0;
  if (bed.wardType === 'ICU' && icuBedCount <= icuReserve) {
    reservePenalty = 50;
  }
  const extraEquipment = bed.equipment.filter(e => !patient.requiredEquipment.includes(e)).length;
  const equipBonus = extraEquipment * 5;

  return baseCost - waitPenalty + reservePenalty - equipBonus;
}

/**
 * Builds a plain-language explanation for an assignment.
 *
 * @param patient The assigned patient.
 * @param bed The assigned bed.
 * @param cost The cost of the assignment.
 * @returns A human-readable explanation string.
 */
function buildExplanation(
  patient: PatientForAllocation,
  bed: BedForAllocation,
  cost: number
): string {
  const parts: string[] = [];
  parts.push(`Bed ${bed.code} in ${bed.wardType} ward.`);

  if (bed.isIsolation && patient.isolationNeed) {
    parts.push('Isolation room matches patient requirement.');
  }
  const matchedEquip = patient.requiredEquipment.filter(e => bed.equipment.includes(e));
  if (matchedEquip.length > 0) {
    parts.push(`Required equipment available: ${matchedEquip.join(', ')}.`);
  }
  const extraEquip = bed.equipment.filter(e => !patient.requiredEquipment.includes(e));
  if (extraEquip.length > 0) {
    parts.push(`Additional equipment on bed: ${extraEquip.join(', ')}.`);
  }
  parts.push(`Assignment cost score: ${cost.toFixed(1)}.`);
  return parts.join(' ');
}

/**
 * Full Hungarian algorithm (Munkres method) for min-cost assignment.
 *
 * Steps:
 *   1. Subtract row minimums from each row.
 *   2. Subtract column minimums from each column.
 *   3. Use augmenting paths to find a maximum matching among zero-cost entries.
 *   4. If matching is not complete, adjust the dual variables (potentials) and repeat.
 *
 * Handles rectangular matrices by padding to square with INFEASIBLE values.
 *
 * @param costMatrix The n x m cost matrix.
 * @returns An array of [row, col] pairs representing the optimal assignment.
 */
function hungarian(costMatrix: number[][]): [number, number][] {
  const rows = costMatrix.length;
  const cols = costMatrix[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return [];

  const n = Math.max(rows, cols);

  // Pad to square matrix
  const c: number[][] = [];
  for (let i = 0; i < n; i++) {
    c[i] = [];
    for (let j = 0; j < n; j++) {
      if (i < rows && j < cols) {
        c[i][j] = costMatrix[i][j];
      } else {
        c[i][j] = 0; // dummy rows/cols get zero cost
      }
    }
  }

  // u[i] and v[j] are potentials (dual variables)
  const u = new Array(n + 1).fill(0);
  const v = new Array(n + 1).fill(0);
  // p[j] = row assigned to column j (1-indexed internally; 0 means unassigned)
  const p = new Array(n + 1).fill(0);
  // way[j] = previous column in the augmenting path ending at column j
  const way = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(n + 1).fill(Infinity);
    const used = new Array(n + 1).fill(false);

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = -1;

      for (let j = 1; j <= n; j++) {
        if (!used[j]) {
          const cur = c[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }

      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }

      j0 = j1;
    } while (p[j0] !== 0);

    // Trace augmenting path back
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  // Extract assignment (convert back to 0-indexed)
  const result: [number, number][] = [];
  for (let j = 1; j <= n; j++) {
    if (p[j] > 0 && p[j] <= rows && j <= cols) {
      result.push([p[j] - 1, j - 1]);
    }
  }
  return result;
}

/**
 * Runs the Hungarian (Munkres) algorithm to find the minimum-cost assignment
 * of patients to beds.
 *
 * The algorithm guarantees an optimal assignment that minimizes total cost
 * across all patient-bed pairings, subject to hard constraints.
 *
 * @param patients List of patients needing bed assignment.
 * @param beds List of available beds.
 * @param icuReserve Number of ICU beds to keep in reserve (default 2).
 * @returns OptimizerOutput with optimal assignments and explanations.
 */
export function runHungarianAllocation(
  patients: PatientForAllocation[],
  beds: BedForAllocation[],
  icuReserve: number = 2
): OptimizerOutput {
  if (patients.length === 0 || beds.length === 0) {
    return {
      allocations: [],
      unassigned: patients.map(p => p.id),
      totalCost: 0,
      method: 'HUNGARIAN'
    };
  }

  const icuBedCount = beds.filter(b => b.wardType === 'ICU').length;

  // Build cost matrix
  const costMatrix: number[][] = [];
  for (let i = 0; i < patients.length; i++) {
    costMatrix[i] = [];
    for (let j = 0; j < beds.length; j++) {
      costMatrix[i][j] = computeCost(patients[i], beds[j], icuBedCount, icuReserve);
    }
  }

  // Run Hungarian algorithm
  const assignments = hungarian(costMatrix);

  const allocations: AllocationResult[] = [];
  const assignedPatients = new Set<number>();
  let totalCost = 0;

  for (const [row, col] of assignments) {
    const cost = costMatrix[row][col];
    if (cost >= INFEASIBLE) continue; // skip infeasible assignments

    const patient = patients[row];
    const bed = beds[col];
    assignedPatients.add(row);

    allocations.push({
      patientId: patient.id,
      bedId: bed.id,
      bedCode: bed.code,
      score: cost,
      explanation: buildExplanation(patient, bed, cost),
      method: 'HUNGARIAN'
    });
    totalCost += cost;
  }

  const unassigned: string[] = [];
  for (let i = 0; i < patients.length; i++) {
    if (!assignedPatients.has(i)) {
      unassigned.push(patients[i].id);
    }
  }

  return {
    allocations,
    unassigned,
    totalCost,
    method: 'HUNGARIAN'
  };
}
