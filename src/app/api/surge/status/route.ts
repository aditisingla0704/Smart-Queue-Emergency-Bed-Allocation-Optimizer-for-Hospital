import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wards = await prisma.ward.findMany({ include: { beds: { where: { isSimulation: false } } } });

    const surgeWards = wards.map(ward => {
      const total = ward.beds.length;
      const occupied = ward.beds.filter(b => b.status === 'OCCUPIED').length;
      const occupancyRate = total ? occupied / total : 0;
      
      if (occupancyRate > 0.85) {
        return {
          wardId: ward.id,
          wardName: ward.name,
          occupancyRate,
          recommendedActions: ['Divert non-critical patients', 'Call in reserve staff', 'Convert flexible spaces']
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({ surgeWards });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
