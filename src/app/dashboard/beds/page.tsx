'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Bed, User, Activity, Monitor } from 'lucide-react';

interface BedData {
  id: string;
  code: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'RESERVED' | 'OUT_OF_SERVICE';
  ward: string;
  patientName?: string;
  equipment: string[];
  isIsolation: boolean;
}

export default function BedsPage() {
  const [beds, setBeds] = useState<BedData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBeds = async () => {
    setLoading(true);
    // Simulate API fetch
    await new Promise(r => setTimeout(r, 600));
    setBeds([
      { id: '1', code: 'ICU-1', status: 'OCCUPIED', ward: 'Intensive Care', patientName: 'John Doe', equipment: ['Ventilator', 'Monitor'], isIsolation: true },
      { id: '2', code: 'ICU-2', status: 'AVAILABLE', ward: 'Intensive Care', equipment: ['Monitor'], isIsolation: false },
      { id: '3', code: 'ICU-3', status: 'CLEANING', ward: 'Intensive Care', equipment: [], isIsolation: false },
      { id: '4', code: 'GEN-1', status: 'AVAILABLE', ward: 'General Ward', equipment: [], isIsolation: false },
      { id: '5', code: 'GEN-2', status: 'RESERVED', ward: 'General Ward', equipment: [], isIsolation: false },
      { id: '6', code: 'GEN-3', status: 'OUT_OF_SERVICE', ward: 'General Ward', equipment: [], isIsolation: false },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBeds();
    const int = setInterval(fetchBeds, 15000);
    return () => clearInterval(int);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'OCCUPIED': return 'bg-red-500';
      case 'CLEANING': return 'bg-yellow-500';
      case 'RESERVED': return 'bg-blue-500';
      case 'OUT_OF_SERVICE': return 'bg-gray-400';
      default: return 'bg-gray-200';
    }
  };

  const wards = Array.from(new Set(beds.map(b => b.ward)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bed Board</h1>
      </div>

      <div className="flex flex-wrap gap-4 text-sm bg-white p-3 rounded-md border border-gray-200 shadow-sm">
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Available</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Occupied</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>Cleaning</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Reserved</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>Out of Service</div>
      </div>

      {loading && beds.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading beds data...</div>
      ) : (
        <div className="space-y-8">
          {wards.map(ward => {
            const wardBeds = beds.filter(b => b.ward === ward);
            const occupied = wardBeds.filter(b => b.status === 'OCCUPIED').length;
            const occupancy = Math.round((occupied / wardBeds.length) * 100);

            return (
              <section key={ward} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h2 className="text-lg font-semibold text-gray-900">{ward}</h2>
                  <span className="text-sm text-gray-500">Occupancy: {occupancy}%</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wardBeds.map(bed => (
                    <div key={bed.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-gray-900 flex items-center">
                          <Bed size={18} className="mr-2 text-gray-500" />
                          {bed.code}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(bed.status)}`} title={bed.status} />
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-2">
                        {bed.status === 'OCCUPIED' && bed.patientName ? (
                          <div className="flex items-center text-gray-900 font-medium">
                            <User size={14} className="mr-2" />
                            {bed.patientName}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic">No patient</div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2">
                          {bed.isIsolation && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                              Isolation
                            </span>
                          )}
                          {bed.equipment.includes('Ventilator') && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              Vent
                            </span>
                          )}
                          {bed.equipment.includes('Monitor') && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              Mon
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
