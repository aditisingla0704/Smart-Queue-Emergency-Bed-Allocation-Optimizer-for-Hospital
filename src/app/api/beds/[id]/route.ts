import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const bed = await prisma.bed.findUnique({ where: { id } });
    if (!bed) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    return NextResponse.json(bed);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !['BED_MANAGER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, patientId } = body;
    const allowedStatuses = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'RESERVED', 'OUT_OF_SERVICE'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (status === 'AVAILABLE') {
      data.patientId = null;
      data.currentGender = null;
    } else if (status === 'OCCUPIED' && patientId) {
      data.patientId = patientId;
    }

    const updated = await prisma.bed.update({
      where: { id },
      data
    });

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE_STATUS',
      entityType: 'Bed',
      entityId: updated.id,
      details: { status: updated.status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
