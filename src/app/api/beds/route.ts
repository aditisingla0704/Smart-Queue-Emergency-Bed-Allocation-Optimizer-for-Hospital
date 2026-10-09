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
