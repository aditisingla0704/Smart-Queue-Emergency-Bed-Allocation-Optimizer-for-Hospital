import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { runOptimizer } from '@/lib/optimizer';
import { PatientForAllocation, BedForAllocation } from '@/lib/optimizer/types';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !['BED_MANAGER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { method = 'BOTH' } = await req.json().catch(() => ({}));

    const rawPatients = await prisma.patient.findMany({
      where: {
        status: { in: ['ADMITTED', 'QUEUED', 'WAITING'] },
        bedId: null,
        isSimulation: false
      }
    });

    const rawBeds = await prisma.bed.findMany({
      where: { status: 'AVAILABLE', isSimulation: false },
      include: { ward: true }
    });

    const now = Date.now();
    const formattedPatients: PatientForAllocation[] = rawPatients.map(p => {
      let requiredEquipment: string[] = [];
      try {
        requiredEquipment = JSON.parse(p.equipment || '[]');
      } catch {
        requiredEquipment = [];
      }

      const waitMins = Math.max(0, Math.round((now - new Date(p.queuedAt).getTime()) / 60000));

      return {
        id: p.id,
        name: p.name,
        triageLevel: p.triageLevel,
        priorityScore: p.priorityScore,
        waitingMinutes: waitMins,
        isolationNeed: p.isolationNeed,
        requiredEquipment,
        sex: (p.sex as 'MALE' | 'FEMALE' | 'OTHER') || 'OTHER',
        age: p.age,
        wardTypeNeeded: p.triageLevel <= 2 ? 'ICU' : 'GENERAL'
      };
    });

    const formattedBeds: BedForAllocation[] = rawBeds.map(b => {
      let equip: string[] = [];
      try {
        equip = JSON.parse(b.equipment || '[]');
      } catch {
        equip = [];
      }

      return {
        id: b.id,
        code: b.code,
        wardId: b.wardId,
        wardType: b.ward.type,
        status: b.status,
        equipment: equip,
        isIsolation: b.isIsolation,
        currentGender: b.currentGender,
        genderPolicy: b.ward.genderPolicy
      };
    });

    const optimizerResult = runOptimizer(formattedPatients, formattedBeds, {
      method: method as 'GREEDY' | 'HUNGARIAN' | 'BOTH'
    });

    const createdSuggestions = [];

    const targetAllocations = 'allocations' in optimizerResult
      ? optimizerResult.allocations
      : optimizerResult.hungarian.allocations;

    for (const alloc of targetAllocations) {
      const created = await prisma.bedAllocation.create({
        data: {
          patientId: alloc.patientId,
          bedId: alloc.bedId,
          status: 'SUGGESTED',
          optimizerMethod: alloc.method,
          explanation: alloc.explanation,
          suggestedBySystem: true
        }
      });
      createdSuggestions.push(created);
    }

    await logAudit({
      userId: session.user.id,
      action: 'OPTIMIZER_RUN',
      entityType: 'Allocation',
      entityId: 'BATCH',
      details: { method, count: createdSuggestions.length }
    });

    return NextResponse.json({
      result: optimizerResult,
      created: createdSuggestions
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
