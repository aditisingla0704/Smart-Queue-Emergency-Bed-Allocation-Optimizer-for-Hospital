import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { calculatePriorityScore } from '@/lib/priority-queue';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { bed: true, assignedDoctor: true }
    });
    if (!patient) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const body = await req.json();
    const role = session.user.role;
    
    let allowedUpdates: any = {};
    if (role === 'TRIAGE_NURSE') {
      const { vitals, triageLevel, isolationNeed, equipment } = body;
      if (vitals !== undefined) allowedUpdates.vitals = typeof vitals === 'string' ? vitals : JSON.stringify(vitals);
      if (triageLevel !== undefined) allowedUpdates.triageLevel = triageLevel;
      if (isolationNeed !== undefined) allowedUpdates.isolationNeed = isolationNeed;
      if (equipment !== undefined) allowedUpdates.equipment = Array.isArray(equipment) ? JSON.stringify(equipment) : equipment;
    } else if (role === 'DOCTOR') {
      const { status, assignedDoctorId } = body;
      if (status && ['BEING_SEEN', 'ADMITTED', 'DISCHARGED'].includes(status)) {
        allowedUpdates.status = status;
        if (status === 'BEING_SEEN' && !patient.seenAt) allowedUpdates.seenAt = new Date();
        if (status === 'DISCHARGED') allowedUpdates.dischargedAt = new Date();
      }
      if (assignedDoctorId) allowedUpdates.assignedDoctorId = assignedDoctorId;
    } else if (role === 'BED_MANAGER') {
      const { bedId, status } = body;
      if (bedId !== undefined) allowedUpdates.bedId = bedId;
      if (status) allowedUpdates.status = status;
    } else if (role === 'ADMIN') {
      allowedUpdates = { ...body };
      if (body.vitals && typeof body.vitals !== 'string') allowedUpdates.vitals = JSON.stringify(body.vitals);
      if (body.equipment && Array.isArray(body.equipment)) allowedUpdates.equipment = JSON.stringify(body.equipment);
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (allowedUpdates.triageLevel || allowedUpdates.vitals) {
      const flags = typeof patient.flags === 'string' ? JSON.parse(patient.flags || '{}') : (patient.flags || {});
      const now = Date.now();
      const waitingMinutes = Math.max(0, Math.round((now - new Date(patient.queuedAt).getTime()) / 60000));
      allowedUpdates.priorityScore = calculatePriorityScore({
        triageLevel: allowedUpdates.triageLevel || patient.triageLevel,
        age: patient.age,
        waitingMinutes,
        flags
      });
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: allowedUpdates
    });

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      entityType: 'Patient',
      entityId: patient.id,
      details: allowedUpdates
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
