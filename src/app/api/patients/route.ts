import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { patientIntakeSchema } from '@/lib/validation';
import { calculatePriorityScore } from '@/lib/priority-queue';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const triageLevel = searchParams.get('triageLevel');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const simulation = searchParams.get('simulation') === 'true';

    const where: any = { isSimulation: simulation };
    if (status) where.status = status;
    if (triageLevel) where.triageLevel = parseInt(triageLevel);
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { tempId: { contains: search } }
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { bed: true, assignedDoctor: true }
      }),
      prisma.patient.count({ where })
    ]);

    return NextResponse.json({ data: patients, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !['TRIAGE_NURSE', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = patientIntakeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const data = parsed.data;
    const tempId = !data.name ? 'TEMP-' + Date.now().toString().slice(-6) : null;
    const name = data.name || null;

    const isPediatric = data.age < 14;
    const flags = {
      isPregnant: data.isPregnant || false,
      isInfectionRisk: data.isInfectionRisk || false,
      isPediatric
    };

    const priorityScore = calculatePriorityScore({
      triageLevel: data.triageLevel,
      age: data.age,
      waitingMinutes: 0,
      flags
    });

    const patient = await prisma.patient.create({
      data: {
        name,
        tempId,
        age: data.age,
        sex: data.sex,
        chiefComplaint: data.chiefComplaint,
        triageLevel: data.triageLevel,
        vitals: JSON.stringify(data.vitals || {}),
        isolationNeed: data.isolationNeed,
        equipment: JSON.stringify(data.equipment || []),
        flags: JSON.stringify(flags),
        priorityScore,
        status: 'WAITING',
        queuedAt: new Date()
      }
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      entityType: 'Patient',
      entityId: patient.id,
      details: { triageLevel: data.triageLevel, priorityScore }
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
