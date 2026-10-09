'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface QueuePatient {
  id: string;
  name: string;
  triageLevel: number;
  priorityScore: number;
  waitTimeMins: number;
  estimatedWaitMins: number;
  status: string;
}

export default function QueuePage() {
  const [patients, setPatients] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      // In real implementation: const res = await fetch('/api/patients/queue');
      // Simulated response
      await new Promise(resolve => setTimeout(resolve, 800));
      setPatients([
        { id: 'P-101', name: 'John Doe', triageLevel: 1, priorityScore: 95, waitTimeMins: 12, estimatedWaitMins: 0, status: 'WAITING' },
        { id: 'P-102', name: 'Jane Smith', triageLevel: 2, priorityScore: 75, waitTimeMins: 45, estimatedWaitMins: 15, status: 'WAITING' },
        { id: 'P-103', name: 'Unidentified Male', triageLevel: 3, priorityScore: 40, waitTimeMins: 120, estimatedWaitMins: 60, status: 'WAITING' },
      ]);
    } catch (err) {
      setError('Failed to load queue data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const getTriageColor = (level: number) => {
    switch(level) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 5: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Live Queue</h1>
        <button 
          onClick={fetchQueue}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D6E6E]"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={fetchQueue} className="mt-2 text-sm font-medium text-red-700 underline">Try again</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triage Level</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority Score</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wait Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Wait</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center items-center space-x-2 text-gray-500">
                    <RefreshCw className="animate-spin h-5 w-5" />
                    <span>Loading queue...</span>
                  </div>
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 whitespace-nowrap text-center text-gray-500">
                  No patients in queue.
                </td>
              </tr>
            ) : (
              patients.map((patient, idx) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.name}
                    <div className="text-xs text-gray-500">{patient.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTriageColor(patient.triageLevel)}`}>
                      Level {patient.triageLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {patient.priorityScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.waitTimeMins}m
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.estimatedWaitMins}m
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                      {patient.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
