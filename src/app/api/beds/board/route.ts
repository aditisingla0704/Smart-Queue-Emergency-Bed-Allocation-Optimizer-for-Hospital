import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wards = await prisma.ward.findMany({
      include: {
        beds: {
          include: { patient: true }
        }
      }
    });

    const board = wards.map(ward => {
      const totalBeds = ward.beds.length;
      const occupiedBeds = ward.beds.filter(b => b.status === 'OCCUPIED').length;
      const occupancyRate = totalBeds > 0 ? occupiedBeds / totalBeds : 0;
      
      return {
        id: ward.id,
        name: ward.name,
        type: ward.type,
        totalBeds,
        occupiedBeds,
        occupancyRate,
        surgeStatus: occupancyRate > 0.9 ? 'CRITICAL' : occupancyRate > 0.75 ? 'WARNING' : 'NORMAL',
        beds: ward.beds
      };
    });

    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
