import { describe, it, expect } from 'vitest';
import { calculatePriorityScore, estimateWaitTime } from './priority-queue';
import { checkHardConstraints } from './optimizer/constraints';
import { runGreedyAllocation } from './optimizer/greedy';
import { runHungarianAllocation } from './optimizer/hungarian';
import { runOptimizer } from './optimizer';
import { PatientForAllocation, BedForAllocation } from './optimizer/types';

describe('Priority Queue Engine', () => {
  it('assigns 1000 score to critical Level 1 (Resuscitation) patients regardless of wait', () => {
    const score = calculatePriorityScore({
      triageLevel: 1,
      age: 45,
      waitingMinutes: 0,
      flags: {}
    });
    expect(score).toBe(1000);
  });

  it('calculates triage weights correctly for levels 2-5', () => {
    const l2 = calculatePriorityScore({ triageLevel: 2, age: 30, waitingMinutes: 0, flags: {} });
    const l3 = calculatePriorityScore({ triageLevel: 3, age: 30, waitingMinutes: 0, flags: {} });
    const l4 = calculatePriorityScore({ triageLevel: 4, age: 30, waitingMinutes: 0, flags: {} });
    const l5 = calculatePriorityScore({ triageLevel: 5, age: 30, waitingMinutes: 0, flags: {} });

    expect(l2).toBe(80);
    expect(l3).toBe(60);
    expect(l4).toBe(40);
    expect(l5).toBe(20);
  });

  it('adds aging factor capped at 30 points to prevent starvation', () => {
    // 20 minutes wait = +10
    const score20m = calculatePriorityScore({ triageLevel: 4, age: 30, waitingMinutes: 20, flags: {} });
    expect(score20m).toBe(40 + 10);

    // 100 minutes wait = capped at +30
    const score100m = calculatePriorityScore({ triageLevel: 4, age: 30, waitingMinutes: 100, flags: {} });
    expect(score100m).toBe(40 + 30);
  });

  it('applies pediatric, pregnancy, and infection risk bonuses', () => {
    const score = calculatePriorityScore({
      triageLevel: 3, // 60
      age: 8, // pediatric: +5
      waitingMinutes: 0,
      flags: { isPregnant: true, isInfectionRisk: true } // +5, +3
    });
    expect(score).toBe(60 + 5 + 5 + 3);
  });

  it('estimates wait times based on queue position and throughput', () => {
    const wait = estimateWaitTime(3, [10, 12, 14]); // avg 12
    expect(wait).toBe(36);

    const defaultWait = estimateWaitTime(2, []); // default 15
    expect(defaultWait).toBe(30);
  });
});

describe('Optimizer Constraints', () => {
  const basePatient: PatientForAllocation = {
    id: 'p1',
    name: 'Test Patient',
    triageLevel: 2,
    priorityScore: 80,
    waitingMinutes: 15,
    isolationNeed: false,
    requiredEquipment: ['ventilator'],
    sex: 'FEMALE',
    age: 40,
    wardTypeNeeded: 'ICU'
  };

  const baseBed: BedForAllocation = {
    id: 'b1',
    code: 'ICU-1',
    wardId: 'w1',
    wardType: 'ICU',
    status: 'AVAILABLE',
    equipment: ['ventilator', 'oxygen'],
    isIsolation: false,
    currentGender: null,
    genderPolicy: 'ANY'
  };

  it('satisfies constraints when requirements match', () => {
    const result = checkHardConstraints(basePatient, baseBed);
    expect(result.feasible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('rejects ward type mismatch', () => {
    const result = checkHardConstraints(basePatient, { ...baseBed, wardType: 'GENERAL' });
    expect(result.feasible).toBe(false);
    expect(result.reasons.some(r => r.includes('Ward type mismatch'))).toBe(true);
  });

  it('enforces isolation requirement', () => {
    const result = checkHardConstraints({ ...basePatient, isolationNeed: true }, baseBed);
    expect(result.feasible).toBe(false);
    expect(result.reasons.some(r => r.includes('requires isolation'))).toBe(true);
  });

  it('enforces equipment availability', () => {
    const result = checkHardConstraints(basePatient, { ...baseBed, equipment: ['oxygen'] });
    expect(result.feasible).toBe(false);
    expect(result.reasons.some(r => r.includes('Missing required equipment'))).toBe(true);
  });

  it('enforces gender policies', () => {
    const maleOnlyBed = { ...baseBed, genderPolicy: 'MALE_ONLY' };
    expect(checkHardConstraints(basePatient, maleOnlyBed).feasible).toBe(false);

    const femaleOnlyBed = { ...baseBed, genderPolicy: 'FEMALE_ONLY' };
    expect(checkHardConstraints(basePatient, femaleOnlyBed).feasible).toBe(true);

    const sameGenderOccupiedByMale = { ...baseBed, genderPolicy: 'SAME_GENDER', currentGender: 'MALE' };
    expect(checkHardConstraints(basePatient, sameGenderOccupiedByMale).feasible).toBe(false);
  });
});

describe('Optimizer Edge Cases & Algorithms', () => {
  const patient1: PatientForAllocation = {
    id: 'p1',
    name: 'Critical Patient',
    triageLevel: 1,
    priorityScore: 1000,
    waitingMinutes: 5,
    isolationNeed: false,
    requiredEquipment: ['ventilator'],
    sex: 'MALE',
    age: 55,
    wardTypeNeeded: 'ICU'
  };

  const patient2: PatientForAllocation = {
    id: 'p2',
    name: 'Isolation Patient',
    triageLevel: 2,
    priorityScore: 85,
    waitingMinutes: 30,
    isolationNeed: true,
    requiredEquipment: ['oxygen'],
    sex: 'FEMALE',
    age: 32,
    wardTypeNeeded: 'ISOLATION'
  };

  const bedIcu: BedForAllocation = {
    id: 'b-icu',
    code: 'ICU-10',
    wardId: 'w-icu',
    wardType: 'ICU',
    status: 'AVAILABLE',
    equipment: ['ventilator', 'cardiac_monitor'],
    isIsolation: false,
    currentGender: null,
    genderPolicy: 'ANY'
  };

  const bedIso: BedForAllocation = {
    id: 'b-iso',
    code: 'ISO-01',
    wardId: 'w-iso',
    wardType: 'ISOLATION',
    status: 'AVAILABLE',
    equipment: ['oxygen'],
    isIsolation: true,
    currentGender: null,
    genderPolicy: 'ANY'
  };

  it('handles empty patients or beds gracefully', () => {
    const resGreedy = runGreedyAllocation([], [bedIcu]);
    expect(resGreedy.allocations).toHaveLength(0);
    expect(resGreedy.unassigned).toHaveLength(0);

    const resNoBeds = runGreedyAllocation([patient1], []);
    expect(resNoBeds.allocations).toHaveLength(0);
    expect(resNoBeds.unassigned).toEqual(['p1']);

    const resHung = runHungarianAllocation([patient1], []);
    expect(resHung.allocations).toHaveLength(0);
    expect(resHung.unassigned).toEqual(['p1']);
  });

  it('allocates patients correctly with greedy optimizer', () => {
    const result = runGreedyAllocation([patient1, patient2], [bedIcu, bedIso]);
    expect(result.allocations).toHaveLength(2);
    expect(result.unassigned).toHaveLength(0);

    const alloc1 = result.allocations.find(a => a.patientId === 'p1');
    expect(alloc1?.bedId).toBe('b-icu');
    expect(alloc1?.explanation).toContain('ICU-10');

    const alloc2 = result.allocations.find(a => a.patientId === 'p2');
    expect(alloc2?.bedId).toBe('b-iso');
  });

  it('allocates patients correctly with hungarian optimizer', () => {
    const result = runHungarianAllocation([patient1, patient2], [bedIcu, bedIso]);
    expect(result.allocations).toHaveLength(2);
    expect(result.unassigned).toHaveLength(0);

    const alloc1 = result.allocations.find(a => a.patientId === 'p1');
    expect(alloc1?.bedId).toBe('b-icu');

    const alloc2 = result.allocations.find(a => a.patientId === 'p2');
    expect(alloc2?.bedId).toBe('b-iso');
  });

  it('runs comparison mode with both algorithms', () => {
    const result = runOptimizer([patient1], [bedIcu], { method: 'BOTH' });
    expect('greedy' in result).toBe(true);
    expect('hungarian' in result).toBe(true);
    if ('greedy' in result) {
      expect(result.greedy.allocations).toHaveLength(1);
      expect(result.hungarian.allocations).toHaveLength(1);
    }
  });

  it('handles simultaneous critical arrivals and leaves no feasible bed unassigned', () => {
    const critA: PatientForAllocation = { ...patient1, id: 'pa', waitingMinutes: 10 };
    const critB: PatientForAllocation = { ...patient1, id: 'pb', waitingMinutes: 20 };
    const bedIcu2: BedForAllocation = { ...bedIcu, id: 'b-icu-2', code: 'ICU-11' };

    const result = runHungarianAllocation([critA, critB], [bedIcu, bedIcu2]);
    expect(result.allocations).toHaveLength(2);
    expect(result.unassigned).toHaveLength(0);
  });
});
