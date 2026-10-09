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
