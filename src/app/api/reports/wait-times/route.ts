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
