import React from 'react';
import { TrendingUp, AlertOctagon, LogOut, PlusCircle } from 'lucide-react';

export default function SurgePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Surge Management</h1>
      </div>

      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-md">
        <div className="flex">
          <AlertOctagon className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h2 className="text-lg font-bold text-red-900">Level 2 Surge Alert Active</h2>
            <p className="text-red-700 text-sm mt-1">
              General Medical Ward occupancy has exceeded 90% capacity. Protocol dictates immediate review of potential discharges.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center">
            <TrendingUp className="text-gray-500 mr-2" size={18} />
            <h3 className="font-bold text-gray-900">Capacity Status</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium text-gray-900">Intensive Care Unit</span>
                <span className="text-gray-500">80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium text-gray-900">General Medical</span>
                <span className="text-red-600 font-bold">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium text-gray-900">Pediatrics</span>
                <span className="text-gray-500">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center">
            <AlertOctagon className="text-gray-500 mr-2" size={18} />
            <h3 className="font-bold text-gray-900">Recommended Actions</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="border border-gray-200 rounded-md p-3 flex justify-between items-center hover:bg-gray-50">
              <div className="flex items-center">
                <LogOut className="text-[#0D6E6E] mr-3" size={20} />
                <div>
                  <div className="text-sm font-bold text-gray-900">Review 4 Discharge Candidates</div>
                  <div className="text-xs text-gray-500">Patients ready for discharge or step-down.</div>
                </div>
              </div>
              <button className="text-sm font-medium text-[#0D6E6E] hover:underline">Review</button>
            </div>
            
            <div className="border border-gray-200 rounded-md p-3 flex justify-between items-center hover:bg-gray-50">
              <div className="flex items-center">
                <PlusCircle className="text-[#0D6E6E] mr-3" size={20} />
                <div>
                  <div className="text-sm font-bold text-gray-900">Open Overflow Area B</div>
                  <div className="text-xs text-gray-500">Adds 8 temporary beds to General Medical.</div>
                </div>
              </div>
              <button className="text-sm font-medium text-[#0D6E6E] hover:underline">Execute</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
