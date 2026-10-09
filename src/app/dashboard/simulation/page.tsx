'use client';

import React, { useState } from 'react';
import { Play, Square, Settings, AlertTriangle, Activity } from 'lucide-react';

export default function SimulationPage() {
  const [isSimulating, setIsSimulating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-r-md">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-amber-600 mr-3" />
          <div>
            <h2 className="text-lg font-bold text-amber-900">SIMULATION MODE</h2>
            <p className="text-amber-700 text-sm">
              This is a sandbox for testing. Simulated data is separate from production data.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Traffic Simulation</h1>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsSimulating(false)}
            disabled={!isSimulating}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Square size={16} />
            <span>Stop</span>
          </button>
          <button 
            onClick={() => setIsSimulating(true)}
            disabled={isSimulating}
            className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            <Play size={16} />
            <span>Start Simulation</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
            <div className="flex items-center mb-4 pb-2 border-b border-gray-100">
              <Settings className="text-gray-500 mr-2" size={18} />
              <h3 className="font-bold text-gray-900">Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Rate</label>
                <select disabled={isSimulating} className="w-full border border-gray-300 rounded-md text-sm p-2 bg-white">
                  <option>Low (1 patient / 30m)</option>
                  <option>Normal (1 patient / 15m)</option>
                  <option>High (1 patient / 5m)</option>
                  <option>Surge (1 patient / 2m)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acuity Distribution</label>
                <select disabled={isSimulating} className="w-full border border-gray-300 rounded-md text-sm p-2 bg-white">
                  <option>Standard (Mostly L3/L4)</option>
                  <option>Critical Heavy (Mostly L1/L2)</option>
                  <option>Minor Heavy (Mostly L4/L5)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Live Simulation Feed</h3>
              {isSimulating && (
                <span className="flex items-center text-amber-600 text-xs font-bold animate-pulse">
                  <Activity size={12} className="mr-1" /> ACTIVE
                </span>
              )}
            </div>
            <div className="p-4 flex-1 bg-gray-900 text-green-400 font-mono text-sm overflow-y-auto rounded-b-lg">
              {isSimulating ? (
                <div className="space-y-1">
                  <div>[10:00:00] Simulation initialized...</div>
                  <div>[10:00:02] Loading hospital state...</div>
                  <div>[10:00:05] Applying normal arrival distribution.</div>
                  <div className="text-white mt-4 italic">Waiting for events...</div>
                </div>
              ) : (
                <div className="text-gray-500 text-center mt-20">
                  Simulation is stopped.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
