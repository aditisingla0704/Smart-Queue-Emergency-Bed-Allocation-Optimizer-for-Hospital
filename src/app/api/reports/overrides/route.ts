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
    
    return NextResponse.json({ overrides, userCounts });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
