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
        data: {
          status: 'CONFIRMED',
          confirmedById: session.user.id
        }
      }),
      prisma.bed.update({
        where: { id: allocation.bedId },
        data: {
          status: 'OCCUPIED'
        }
      }),
      prisma.patient.update({
        where: { id: allocation.patientId },
        data: {
          bedId: allocation.bedId,
          status: 'ADMITTED',
          admittedAt: new Date()
        }
      })
    ]);

    await logAudit({
      userId: session.user.id,
      action: 'CONFIRM',
      entityType: 'Allocation',
      entityId: allocationId,
      details: { bedId: allocation.bedId, patientId: allocation.patientId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
