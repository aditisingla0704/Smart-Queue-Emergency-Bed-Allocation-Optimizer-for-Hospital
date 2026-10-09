import { PatientForAllocation, BedForAllocation, OptimizerOutput } from './types';
import { runGreedyAllocation } from './greedy';
import { runHungarianAllocation } from './hungarian';

export * from './types';
export * from './constraints';
export * from './greedy';
export * from './hungarian';

/**
 * Runs the assignment optimizer to allocate beds to patients.
 * 
 * @param patients List of patients to allocate.
 * @param beds List of available beds.
 * @param options Configuration options.
 * @returns The optimizer output or both outputs for comparison.
 */
export function runOptimizer(
  patients: PatientForAllocation[],
  beds: BedForAllocation[],
  options?: { method?: 'GREEDY' | 'HUNGARIAN' | 'BOTH', icuReserve?: number }
): OptimizerOutput | { greedy: OptimizerOutput; hungarian: OptimizerOutput } {
  const method = options?.method || 'GREEDY';
  const icuReserve = options?.icuReserve ?? 2;

  if (method === 'BOTH') {
    return {
      greedy: runGreedyAllocation(patients, beds, icuReserve),
      hungarian: runHungarianAllocation(patients, beds, icuReserve)
    };
  } else if (method === 'HUNGARIAN') {
    return runHungarianAllocation(patients, beds, icuReserve);
  } else {
    return runGreedyAllocation(patients, beds, icuReserve);
  }
}
