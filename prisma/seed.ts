import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Users
  const triageNurse = await prisma.user.create({ data: { email: 'triage@medqueue.local', passwordHash, name: 'Alice Triage', role: 'TRIAGE_NURSE' } });
  const doctor = await prisma.user.create({ data: { email: 'doctor@medqueue.local', passwordHash, name: 'Dr. Bob Smith', role: 'DOCTOR' } });
  const bedManager = await prisma.user.create({ data: { email: 'bedmanager@medqueue.local', passwordHash, name: 'Charlie Manager', role: 'BED_MANAGER' } });
  const admin = await prisma.user.create({ data: { email: 'admin@medqueue.local', passwordHash, name: 'Diana Admin', role: 'ADMIN' } });

  // Wards & Beds
  const wardsConfig = [
    { name: 'Emergency Room', type: 'ER', bedCount: 8, isolationCount: 2, equipment: ['oxygen', 'cardiac_monitor'] },
    { name: 'General Ward A', type: 'GENERAL', bedCount: 20, isolationCount: 0, equipment: [] },
    { name: 'Intensive Care Unit', type: 'ICU', bedCount: 6, isolationCount: 2, equipment: ['ventilator', 'cardiac_monitor', 'oxygen'] },
    { name: 'Isolation Ward', type: 'ISOLATION', bedCount: 4, isolationCount: 4, equipment: ['oxygen'] },
    { name: 'Pediatric Wing', type: 'PEDIATRIC', bedCount: 8, isolationCount: 1, equipment: [] },
    { name: 'Maternity Ward', type: 'MATERNITY', genderPolicy: 'FEMALE_ONLY', bedCount: 6, isolationCount: 0, equipment: [] },
  ];

  for (const config of wardsConfig) {
    const ward = await prisma.ward.create({
      data: {
        name: config.name,
        type: config.type,
        genderPolicy: config.genderPolicy || 'ANY',
      },
    });

    for (let i = 1; i <= config.bedCount; i++) {
      const isIso = i <= config.isolationCount;
      const equip = isIso && config.type === 'ER' ? ['oxygen'] : config.equipment;
      await prisma.bed.create({
        data: {
          code: `${config.type.substring(0, 3)}-${i.toString().padStart(2, '0')}`,
          wardId: ward.id,
          equipment: JSON.stringify(equip),
          isIsolation: isIso,
        },
      });
    }

    await prisma.surgeConfig.create({
      data: { wardType: config.type, threshold: 85 },
    });
  }

  // Sample Patients (Fake data)
  const samplePatients = [
    { name: 'John Doe', age: 45, sex: 'MALE', chiefComplaint: 'Chest pain', triageLevel: 2, vitals: JSON.stringify({ hr: 110, bp: '150/90', temp: 37.2 }), status: 'WAITING' },
    { name: 'Jane Smith', age: 30, sex: 'FEMALE', chiefComplaint: 'Abdominal pain', triageLevel: 3, vitals: JSON.stringify({ hr: 85, bp: '120/80', temp: 37.5 }), status: 'WAITING' },
    { name: 'Robert Johnson', age: 60, sex: 'MALE', chiefComplaint: 'Shortness of breath', triageLevel: 2, vitals: JSON.stringify({ hr: 95, bp: '140/85', temp: 38.1 }), equipment: JSON.stringify(['oxygen']), status: 'WAITING' },
    { name: 'Emily Davis', age: 25, sex: 'FEMALE', chiefComplaint: 'Fever and cough', triageLevel: 4, vitals: JSON.stringify({ hr: 90, bp: '110/70', temp: 39.0 }), isolationNeed: true, status: 'WAITING' },
    { name: 'Michael Brown', age: 50, sex: 'MALE', chiefComplaint: 'Laceration to left arm', triageLevel: 4, vitals: JSON.stringify({ hr: 80, bp: '130/80', temp: 36.8 }), status: 'WAITING' },
    { name: 'Sarah Wilson', age: 70, sex: 'FEMALE', chiefComplaint: 'Fall, hip pain', triageLevel: 3, vitals: JSON.stringify({ hr: 75, bp: '135/85', temp: 36.9 }), status: 'WAITING' },
    { name: 'David Lee', age: 40, sex: 'MALE', chiefComplaint: 'Severe headache', triageLevel: 2, vitals: JSON.stringify({ hr: 100, bp: '160/95', temp: 37.1 }), status: 'WAITING' },
    { name: 'Lisa Taylor', age: 35, sex: 'FEMALE', chiefComplaint: 'Pregnancy complications', triageLevel: 2, vitals: JSON.stringify({ hr: 88, bp: '125/80', temp: 37.0 }), status: 'WAITING' },
    { name: 'James Anderson', age: 55, sex: 'MALE', chiefComplaint: 'Suspected stroke', triageLevel: 1, vitals: JSON.stringify({ hr: 120, bp: '180/100', temp: 37.3 }), equipment: JSON.stringify(['cardiac_monitor', 'oxygen']), status: 'WAITING' },
    { name: 'Unidentified Male', tempId: 'UNK-1234', age: 30, sex: 'MALE', chiefComplaint: 'Unconscious', triageLevel: 1, vitals: JSON.stringify({ hr: 130, bp: '90/60', temp: 36.5 }), equipment: JSON.stringify(['ventilator', 'cardiac_monitor']), status: 'WAITING' },
  ];

  for (const p of samplePatients) {
    await prisma.patient.create({ data: p });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
