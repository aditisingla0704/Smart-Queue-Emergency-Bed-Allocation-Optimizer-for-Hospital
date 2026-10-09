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
      return Math.max(1, (seenTime - queuedTime) / 60000);
    });

    const now = new Date().getTime();
    
    const enriched = patients.map((p, index) => {
      const waitTime = estimateWaitTime(index + 1, serviceTimes);
      const liveWaitMinutes = Math.max(0, Math.round((now - new Date(p.queuedAt).getTime()) / 60000));
      return { ...p, estimatedWaitTime: waitTime, liveWaitMinutes };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
