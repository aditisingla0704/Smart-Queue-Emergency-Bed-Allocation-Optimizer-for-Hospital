import { z } from 'zod';

export const patientIntakeSchema = z.object({
  name: z.string().optional(),
  age: z.number().min(0).max(150),
  sex: z.enum(['MALE', 'FEMALE', 'OTHER']),
  chiefComplaint: z.string().min(2).max(500),
  triageLevel: z.number().min(1).max(5),
  vitals: z.object({
    heartRate: z.number().optional(),
    bloodPressureSystolic: z.number().optional(),
    bloodPressureDiastolic: z.number().optional(),
    temperature: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    respiratoryRate: z.number().optional(),
  }).optional(),
  isolationNeed: z.boolean().default(false),
  equipment: z.array(z.string()).default([]),
  isPregnant: z.boolean().optional(),
  isInfectionRisk: z.boolean().optional(),
});

export type PatientIntake = z.infer<typeof patientIntakeSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type Login = z.infer<typeof loginSchema>;

export const bedStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'RESERVED', 'OUT_OF_SERVICE']),
});

export type BedStatus = z.infer<typeof bedStatusSchema>;

export const allocationOverrideSchema = z.object({
  allocationId: z.string(),
  newBedId: z.string(),
  reason: z.string().min(1, 'Reason is required for override'),
});

export type AllocationOverride = z.infer<typeof allocationOverrideSchema>;

export const wardSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['ER', 'GENERAL', 'ICU', 'ISOLATION', 'PEDIATRIC', 'MATERNITY']),
  genderPolicy: z.enum(['ANY', 'MALE_ONLY', 'FEMALE_ONLY', 'SAME_GENDER']).default('ANY'),
});

export type Ward = z.infer<typeof wardSchema>;
