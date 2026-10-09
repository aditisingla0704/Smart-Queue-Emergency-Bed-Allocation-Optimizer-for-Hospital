import React from 'react';
import { Plus, Edit2, LayoutGrid } from 'lucide-react';

export default function WardsPage() {
  const wards = [
    { id: '1', name: 'Intensive Care Unit', type: 'ICU', totalBeds: 12, occupied: 10, genderPolicy: 'MIXED' },
    { id: '2', name: 'General Medical', type: 'GENERAL', totalBeds: 24, occupied: 18, genderPolicy: 'MALE_ONLY' },
    { id: '3', name: 'Pediatrics', type: 'PEDIATRIC', totalBeds: 15, occupied: 5, genderPolicy: 'MIXED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ward Management</h1>
        <button className="flex items-center space-x-2 bg-[#0D6E6E] text-white px-4 py-2 rounded-md hover:bg-[#0A5555]">
          <Plus size={16} />
          <span>Add Ward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wards.map(ward => (
          <div key={ward.id} className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{ward.name}</h2>
              <button className="text-gray-400 hover:text-[#0D6E6E]">
                <Edit2 size={16} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Ward Type</span>
                <span className="font-medium text-gray-900">{ward.type}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Gender Policy</span>
                <span className="font-medium text-gray-900">{ward.genderPolicy.replace('_', ' ')}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="text-gray-500">Occupancy</span>
                  <span className="font-medium text-gray-900">{ward.occupied} / {ward.totalBeds} Beds</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (ward.occupied / ward.totalBeds) > 0.85 ? 'bg-red-500' : 
                      (ward.occupied / ward.totalBeds) > 0.70 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(ward.occupied / ward.totalBeds) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-2">
                <button className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-sm">
                  <LayoutGrid size={16} />
                  <span>Manage Beds</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
