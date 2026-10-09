export interface PatientForAllocation {
  id: string;
  name: string | null;
  triageLevel: number;
  priorityScore: number;
  waitingMinutes: number;
  isolationNeed: boolean;
  requiredEquipment: string[];
  sex: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  wardTypeNeeded: string;
}

export interface BedForAllocation {
  id: string;
  code: string;
  wardId: string;
  wardType: string;
  status: string;
  equipment: string[];
  isIsolation: boolean;
  currentGender: string | null;
  genderPolicy: string;
}

export interface AllocationResult {
  patientId: string;
  bedId: string;
  bedCode: string;
  score: number;
  explanation: string;
  method: 'GREEDY' | 'HUNGARIAN';
}

export interface OptimizerOutput {
  allocations: AllocationResult[];
  unassigned: string[];
  totalCost: number;
  method: 'GREEDY' | 'HUNGARIAN';
}
