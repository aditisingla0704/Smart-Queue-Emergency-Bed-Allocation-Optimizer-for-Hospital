'use client';

import React, { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

export default function AllocationsPage() {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  
  // Simulated data
  const suggestions = [
    {
      id: 'sugg-1',
      patientName: 'Jane Smith',
      triageLevel: 2,
      waitTime: '45m',
      suggestedBed: 'ICU-1',
      optimizerMethod: 'Hungarian Algorithm',
      explanation: 'Optimal match based on equipment needs (Ventilator) and acuity.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pending Allocations</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {suggestions.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
            No pending allocation suggestions at this time.
          </div>
        ) : (
          suggestions.map(s => (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{s.patientName}</h3>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                    Triage {s.triageLevel}
                  </span>
                </div>
                <div className="text-sm text-gray-500">Waiting: {s.waitTime}</div>
              </div>
              
              <div className="p-4 flex-1">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-500">Suggested Bed:</span>
                  <div className="text-xl font-bold text-[#0D6E6E]">{s.suggestedBed}</div>
                </div>
                
                <div className="text-sm text-gray-600 mb-4 bg-teal-50 p-3 rounded-md border border-teal-100">
                  <p className="font-medium text-teal-800 mb-1 text-xs uppercase tracking-wider">{s.optimizerMethod}</p>
                  <p>{s.explanation}</p>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex space-x-3">
                <button className="flex-1 bg-[#0D6E6E] hover:bg-[#0F8A8A] text-white px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors">
                  <Check size={16} className="mr-2" />
                  Confirm
                </button>
                <button 
                  onClick={() => setShowOverrideModal(true)}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
                >
                  <X size={16} className="mr-2" />
                  Override
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Allocations History</h2>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10:45 AM</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">GEN-1</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Auto (Hungarian)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showOverrideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Override Allocation</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for overriding the optimized suggestion.</p>
            
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring-[#0D6E6E] focus:border-[#0D6E6E]"
              rows={3}
              placeholder="E.g. Bed requires maintenance, patient prefers window..."
            ></textarea>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                disabled={!overrideReason.trim()}
              >
                Submit Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
