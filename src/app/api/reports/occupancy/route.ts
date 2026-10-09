import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wards = await prisma.ward.findMany({ include: { beds: { where: { isSimulation: false } } } });

    let totalGlobalBeds = 0;
    let totalGlobalOccupied = 0;

    const stats = wards.map(ward => {
      const total = ward.beds.length;
      const occupied = ward.beds.filter(b => b.status === 'OCCUPIED').length;
      const available = ward.beds.filter(b => b.status === 'AVAILABLE').length;
      const cleaning = ward.beds.filter(b => b.status === 'CLEANING').length;
      const outOfService = ward.beds.filter(b => b.status === 'OUT_OF_SERVICE').length;
      
      totalGlobalBeds += total;
      totalGlobalOccupied += occupied;

      return {
        wardId: ward.id,
        wardName: ward.name,
        total, occupied, available, cleaning, outOfService,
        occupancyPercentage: total ? (occupied / total) * 100 : 0
      };
    });

    return NextResponse.json({
      wards: stats,
      overallPercentage: totalGlobalBeds ? (totalGlobalOccupied / totalGlobalBeds) * 100 : 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
