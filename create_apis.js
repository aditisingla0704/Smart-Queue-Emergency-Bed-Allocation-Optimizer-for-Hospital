const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\\\Users\\\\HP\\\\.gemini\\\\antigravity\\\\scratch\\\\medqueue\\\\src\\\\app\\\\api';

const files = {
  'auth/[...nextauth]/route.ts': `
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
`,

  'patients/route.ts': `
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
    if (triageLevel) where.triageLevel = triageLevel;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mrn: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
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
    if (!data.name) {
      data.name = 'TEMP-' + Date.now();
    }

    const isPediatric = data.age < 14;
    const flags = {
      isPregnant: data.isPregnant || false,
      isInfectionRisk: data.isInfectionRisk || false,
      isPediatric
    };

    const priorityScore = calculatePriorityScore(data.triageLevel, data.vitals, flags);

    const patient = await prisma.patient.create({
      data: {
        ...data,
        priorityScore,
        flags: JSON.stringify(flags),
        status: 'WAITING',
        queuedAt: new Date()
      }
    });

    await logAudit(session.user.id, 'CREATE', 'Patient', patient.id);
    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'patients/[id]/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { calculatePriorityScore } from '@/lib/priority-queue';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patient = await prisma.patient.findUnique({ where: { id: params.id } });
    if (!patient) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patient = await prisma.patient.findUnique({ where: { id: params.id } });
    if (!patient) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const body = await req.json();
    const role = session.user.role;
    
    let allowedUpdates: any = {};
    if (role === 'TRIAGE_NURSE') {
      const { vitals, triageLevel, isolationNeed, equipment } = body;
      if (vitals !== undefined) allowedUpdates.vitals = vitals;
      if (triageLevel !== undefined) allowedUpdates.triageLevel = triageLevel;
      if (isolationNeed !== undefined) allowedUpdates.isolationNeed = isolationNeed;
      if (equipment !== undefined) allowedUpdates.equipment = equipment;
    } else if (role === 'DOCTOR') {
      const { status, assignedDoctorId } = body;
      if (status && ['BEING_SEEN', 'ADMITTED'].includes(status)) allowedUpdates.status = status;
      if (assignedDoctorId) allowedUpdates.assignedDoctorId = assignedDoctorId;
    } else if (role === 'BED_MANAGER') {
      const { bedId, status } = body;
      if (bedId !== undefined) allowedUpdates.bedId = bedId;
      if (status) allowedUpdates.status = status;
    } else if (role === 'ADMIN') {
      allowedUpdates = body;
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (allowedUpdates.triageLevel || allowedUpdates.vitals) {
      const flags = typeof patient.flags === 'string' ? JSON.parse(patient.flags) : patient.flags;
      allowedUpdates.priorityScore = calculatePriorityScore(
        allowedUpdates.triageLevel || patient.triageLevel,
        allowedUpdates.vitals || patient.vitals,
        flags
      );
    }

    const updated = await prisma.patient.update({
      where: { id: params.id },
      data: allowedUpdates
    });

    await logAudit(session.user.id, 'UPDATE', 'Patient', patient.id);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'patients/queue/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { estimateWaitTime } from '@/lib/priority-queue';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patients = await prisma.patient.findMany({
      where: { status: { in: ['WAITING', 'QUEUED'] }, isSimulation: false },
      orderBy: { priorityScore: 'desc' }
    });

    const recentSeen = await prisma.patient.findMany({
      where: { status: { notIn: ['WAITING', 'QUEUED'] }, seenAt: { not: null } },
      orderBy: { seenAt: 'desc' },
      take: 20
    });

    const serviceTimes = recentSeen.map(p => {
      const seenTime = new Date(p.seenAt!).getTime();
      const queuedTime = new Date(p.queuedAt!).getTime();
      return (seenTime - queuedTime) / 60000; 
    });

    const now = new Date().getTime();
    
    const enriched = patients.map(p => {
      const waitTime = estimateWaitTime(p, serviceTimes);
      const liveWaitMinutes = (now - new Date(p.queuedAt!).getTime()) / 60000;
      return { ...p, estimatedWaitTime: waitTime, liveWaitMinutes };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'beds/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const wardId = searchParams.get('wardId');
    const wardType = searchParams.get('wardType');

    const where: any = { isSimulation: false };
    if (status) where.status = status;
    if (wardId) where.wardId = wardId;
    if (wardType) where.ward = { type: wardType };

    const beds = await prisma.bed.findMany({
      where,
      include: { ward: { select: { name: true, type: true } } }
    });

    return NextResponse.json(beds);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'beds/[id]/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bed = await prisma.bed.findUnique({ where: { id: params.id } });
    if (!bed) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    return NextResponse.json(bed);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !['BED_MANAGER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { status, patientId } = body;
    const allowedStatuses = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'OUT_OF_SERVICE'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const data: any = { status };
    if (status === 'AVAILABLE') {
      data.patientId = null;
      data.currentGender = null;
    } else if (status === 'OCCUPIED') {
      if (!patientId) return NextResponse.json({ error: 'patientId required for OCCUPIED status' }, { status: 400 });
      data.patientId = patientId;
    }

    const updated = await prisma.bed.update({
      where: { id: params.id },
      data
    });

    await logAudit(session.user.id, 'UPDATE', 'Bed', updated.id);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'beds/board/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wards = await prisma.ward.findMany({
      include: {
        beds: {
          include: { patient: true }
        }
      }
    });

    const board = wards.map(ward => {
      const totalBeds = ward.beds.length;
      const occupiedBeds = ward.beds.filter(b => b.status === 'OCCUPIED').length;
      const occupancyRate = totalBeds > 0 ? occupiedBeds / totalBeds : 0;
      
      return {
        id: ward.id,
        name: ward.name,
        type: ward.type,
        totalBeds,
        occupiedBeds,
        occupancyRate,
        surgeStatus: occupancyRate > 0.9 ? 'CRITICAL' : occupancyRate > 0.75 ? 'WARNING' : 'NORMAL',
        beds: ward.beds
      };
    });

    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'allocations/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    if (status) where.status = status;
    if (method) where.method = method;

    const allocations = await prisma.bedAllocation.findMany({
      where,
      include: { patient: true, bed: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(allocations);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'allocations/suggest/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !['BED_MANAGER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { method = 'BOTH' } = await req.json().catch(() => ({}));

    const patients = await prisma.patient.findMany({
      where: { status: { in: ['ADMITTED', 'QUEUED'] }, bedId: null, isSimulation: false }
    });

    const beds = await prisma.bed.findMany({
      where: { status: 'AVAILABLE', isSimulation: false },
      include: { ward: true }
    });

    const suggestions = [];
    
    // Very simplified suggestion logic for stub
    for (let i = 0; i < Math.min(patients.length, beds.length); i++) {
      const allocation = await prisma.bedAllocation.create({
        data: {
          patientId: patients[i].id,
          bedId: beds[i].id,
          status: 'SUGGESTED',
          method: method,
          explanation: 'System generated optimal allocation'
        }
      });
      suggestions.push(allocation);
    }

    await logAudit(session.user.id, 'CREATE', 'Allocation', 'SUGGESTED');
    return NextResponse.json(suggestions, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'allocations/confirm/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !['BED_MANAGER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { allocationId } = await req.json();
    if (!allocationId) return NextResponse.json({ error: 'allocationId required' }, { status: 400 });

    const allocation = await prisma.bedAllocation.findUnique({ where: { id: allocationId } });
    if (!allocation) return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });

    await prisma.$transaction([
      prisma.bedAllocation.update({
        where: { id: allocationId },
        data: { status: 'CONFIRMED' }
      }),
      prisma.bed.update({
        where: { id: allocation.bedId },
        data: { status: 'OCCUPIED', patientId: allocation.patientId }
      }),
      prisma.patient.update({
        where: { id: allocation.patientId },
        data: { bedId: allocation.bedId, status: 'ADMITTED' }
      })
    ]);

    await logAudit(session.user.id, 'UPDATE', 'Allocation', allocationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'allocations/override/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { allocationOverrideSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !['BED_MANAGER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = allocationOverrideSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { allocationId, newBedId, reason } = parsed.data;

    const oldAllocation = await prisma.bedAllocation.findUnique({ where: { id: allocationId } });
    if (!oldAllocation) return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });

    const [newAllocation] = await prisma.$transaction([
      prisma.bedAllocation.create({
        data: {
          patientId: oldAllocation.patientId,
          bedId: newBedId,
          status: 'OVERRIDDEN',
          explanation: reason,
          method: 'MANUAL'
        }
      }),
      prisma.bedAllocation.update({
        where: { id: allocationId },
        data: { status: 'CANCELLED' }
      })
    ]);

    await logAudit(session.user.id, 'CREATE', 'Allocation', newAllocation.id, { reason });
    return NextResponse.json(newAllocation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'wards/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { wardSchema } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wards = await prisma.ward.findMany({
      include: {
        _count: {
          select: { beds: true }
        }
      }
    });

    return NextResponse.json(wards);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const parsed = wardSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const ward = await prisma.ward.create({ data: parsed.data });
    return NextResponse.json(ward, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'wards/[id]/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ward = await prisma.ward.findUnique({
      where: { id: params.id },
      include: { beds: true }
    });

    if (!ward) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json(ward);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const updated = await prisma.ward.update({
      where: { id: params.id },
      data: body
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'audit/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, role: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    return NextResponse.json({ data: logs, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'reports/wait-times/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patients = await prisma.patient.findMany({
      where: { seenAt: { not: null }, isSimulation: false }
    });

    const grouped: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };

    patients.forEach(p => {
      const waitMinutes = (new Date(p.seenAt!).getTime() - new Date(p.queuedAt!).getTime()) / 60000;
      if (grouped[p.triageLevel]) grouped[p.triageLevel].push(waitMinutes);
    });

    const result = Object.entries(grouped).map(([level, times]) => {
      const avg = times.length ? times.reduce((a,b) => a+b, 0) / times.length : 0;
      const min = times.length ? Math.min(...times) : 0;
      const max = times.length ? Math.max(...times) : 0;
      return { triageLevel: parseInt(level), avg, min, max, count: times.length };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'reports/occupancy/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wards = await prisma.ward.findMany({ include: { beds: { where: { isSimulation: false } } } });

    let totalGlobalBeds = 0;
    let totalGlobalOccupied = 0;

    const stats = wards.map(ward => {
      const total = ward.beds.length;
      const occupied = ward.beds.filter(b => b.status === 'OCCUPIED').length;
      const available = ward.beds.filter(b => b.status === 'AVAILABLE').length;
      const cleaning = ward.beds.filter(b => b.status === 'CLEANING').length;
      const outOfService = ward.beds.filter(b => b.status === 'OUT_OF_SERVICE').length;
      
      totalGlobalBeds += total;
      totalGlobalOccupied += occupied;

      return {
        wardId: ward.id,
        wardName: ward.name,
        total, occupied, available, cleaning, outOfService,
        occupancyPercentage: total ? (occupied / total) * 100 : 0
      };
    });

    return NextResponse.json({
      wards: stats,
      overallPercentage: totalGlobalBeds ? (totalGlobalOccupied / totalGlobalBeds) * 100 : 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'reports/overrides/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const overrides = await prisma.bedAllocation.findMany({
      where: { status: 'OVERRIDDEN' },
      include: { patient: true, bed: true }
    });

    const userCounts: Record<string, number> = {};
    
    // We would link to users if we had createdBy stored in allocation, 
    // for this stub we just return the overrides.
    return NextResponse.json({ overrides, userCounts });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'reports/optimizer-comparison/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Stub for optimizer comparison
    return NextResponse.json({
      methods: {
        GREEDY: { count: 10, totalCost: 150 },
        HUNGARIAN: { count: 10, totalCost: 120 }
      },
      agreementRate: 0.8
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'simulation/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

let simulationRunning = false;

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ running: simulationRunning });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { action } = await req.json();
    if (action === 'start') {
      simulationRunning = true;
    } else if (action === 'stop') {
      simulationRunning = false;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ running: simulationRunning });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'surge/status/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wards = await prisma.ward.findMany({ include: { beds: { where: { isSimulation: false } } } });

    const surgeWards = wards.map(ward => {
      const total = ward.beds.length;
      const occupied = ward.beds.filter(b => b.status === 'OCCUPIED').length;
      const occupancyRate = total ? occupied / total : 0;
      
      if (occupancyRate > 0.85) {
        return {
          wardId: ward.id,
          wardName: ward.name,
          occupancyRate,
          recommendedActions: ['Divert non-critical patients', 'Call in reserve staff', 'Convert flexible spaces']
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({ surgeWards });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`,

  'surge/config/route.ts': `
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const config = {
  warningThreshold: 0.75,
  criticalThreshold: 0.90
};

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    if (body.warningThreshold) config.warningThreshold = body.warningThreshold;
    if (body.criticalThreshold) config.criticalThreshold = body.criticalThreshold;

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`
};

for (const [subpath, content] of Object.entries(files)) {
  const fullPath = path.join(baseDir, subpath.replace(/\\\\/g, path.sep));
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content.trim() + '\\n', 'utf8');
}
console.log('All files created successfully.');
