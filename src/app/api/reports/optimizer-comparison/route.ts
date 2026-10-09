import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
