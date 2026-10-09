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
          explanation: `Overridden by user. Reason: ${reason}`,
          overrideReason: reason,
          optimizerMethod: 'MANUAL',
          confirmedById: session.user.id
        }
      }),
      prisma.bedAllocation.update({
        where: { id: allocationId },
        data: { status: 'CANCELLED' }
      })
    ]);

    await logAudit({
      userId: session.user.id,
      action: 'OVERRIDE',
      entityType: 'Allocation',
      entityId: newAllocation.id,
      details: { previousAllocationId: allocationId, newBedId, reason }
    });

    return NextResponse.json(newAllocation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
