import React from 'react';
import { Users, Bed, Activity, Clock } from 'lucide-react';
// import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashboardHomePage() {
  // Mock DB query for stats until prisma client is generated
  // const totalPatients = await prisma.patient.count({ where: { status: 'WAITING' } });
  // const availableBeds = await prisma.bed.count({ where: { status: 'AVAILABLE' } });
  // const totalBeds = await prisma.bed.count();
  
  const totalPatients = 12;
  const availableBeds = 8;
  const totalBeds = 40;
  const occupancyRate = Math.round(((totalBeds - availableBeds) / totalBeds) * 100);
  const avgWaitTime = 45; // minutes

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <span className="bg-[#0D6E6E] text-white px-3 py-1 rounded-full text-xs font-medium">
          Sample data
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Patients in Queue</h3>
            <Users className="h-5 w-5 text-[#0D6E6E]" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalPatients}</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Available Beds</h3>
            <Bed className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{availableBeds}</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Occupancy Rate</h3>
            <Activity className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{occupancyRate}%</div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Avg Wait Time</h3>
            <Clock className="h-5 w-5 text-[#0D6E6E]" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{avgWaitTime} min</div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-gray-500 text-sm">
            Activity stream will appear here. No recent actions to display.
          </div>
        </div>
      </div>
    </div>
  );
}
