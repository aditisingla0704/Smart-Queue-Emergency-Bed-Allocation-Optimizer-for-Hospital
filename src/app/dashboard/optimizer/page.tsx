'use client';

import React, { useState } from 'react';
import { Play, Check, ChevronRight, AlertCircle } from 'lucide-react';

export default function OptimizerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunOptimizer = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/allocations/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'BOTH' })
      });

      if (!res.ok) {
        throw new Error('Failed to run optimizer algorithms on current hospital data.');
      }

      const data = await res.json();
      setResults(data.result);
    } catch (err: any) {
      setError(err.message || 'Error executing optimization comparison');
    } finally {
      setIsRunning(false);
    }
  };

  const greedyData = results?.greedy;
  const hungarianData = results?.hungarian;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Optimizer Comparison</h1>
          <p className="text-sm text-gray-500 mt-1">
            Evaluate Greedy vs. Hungarian (Min-Cost Assignment) algorithms against real-time patient queue data.
          </p>
        </div>
        <button 
          onClick={handleRunOptimizer}
          disabled={isRunning}
          className="inline-flex items-center justify-center space-x-2 bg-[#0D6E6E] text-white px-4 py-2.5 rounded-md hover:bg-[#0A5555] disabled:opacity-50 transition-colors shadow-sm text-sm font-medium"
        >
          {isRunning ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Play size={16} />
          )}
          <span>{isRunning ? 'Optimizing...' : 'Run Both Solvers'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center space-x-2 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {results && greedyData && hungarianData ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Greedy Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900">Greedy Baseline Algorithm</h2>
              <p className="text-xs text-gray-500 mt-0.5">Sequential local best match by priority score</p>
            </div>
            <div className="p-4 space-y-4 flex-1">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-sm text-gray-600 font-medium">Total Cost Objective</span>
                <span className="text-xl font-bold text-gray-900">{greedyData.totalCost.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-sm text-gray-600 font-medium">Beds Allocated</span>
                <span className="text-sm font-semibold text-gray-800">{greedyData.allocations.length}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-sm text-gray-600 font-medium">Unassigned Patients</span>
                <span className="text-sm font-semibold text-amber-600">{greedyData.unassigned.length}</span>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mt-4 mb-2">Assignment Decisions</h3>
              {greedyData.allocations.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No eligible patients or matching beds found.</p>
              ) : (
                <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {greedyData.allocations.map((alloc: any, i: number) => (
                    <li key={i} className="p-3 border border-gray-100 rounded-md bg-gray-50 text-xs space-y-1">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-gray-900">{alloc.patientId.slice(-6)}</span>
                        <ChevronRight size={14} className="text-gray-400" />
                        <span className="font-bold text-[#0D6E6E]">{alloc.bedCode}</span>
                        <span className="text-gray-500">Cost: {alloc.score.toFixed(1)}</span>
                      </div>
                      <p className="text-gray-500 text-[11px]">{alloc.explanation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Hungarian Card */}
          <div className="bg-white rounded-lg border-2 border-[#0D6E6E] overflow-hidden shadow-sm flex flex-col">
            <div className="bg-[#0D6E6E] text-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Hungarian Algorithm (Kuhn-Munkres)</h2>
                <p className="text-xs text-teal-100 mt-0.5">Bipartite graph min-cost global optimum</p>
              </div>
              <span className="text-xs font-semibold bg-white text-[#0D6E6E] px-2.5 py-1 rounded-full flex items-center shadow-sm">
                <Check size={12} className="mr-1 stroke-[3]" /> Globally Optimal
              </span>
            </div>
            <div className="p-4 space-y-4 flex-1">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-sm text-gray-600 font-medium">Total Cost Objective</span>
                <span className="text-xl font-bold text-[#0D6E6E]">{hungarianData.totalCost.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-sm text-gray-600 font-medium">Beds Allocated</span>
                <span className="text-sm font-semibold text-gray-800">{hungarianData.allocations.length}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-sm text-gray-600 font-medium">Unassigned Patients</span>
                <span className="text-sm font-semibold text-amber-600">{hungarianData.unassigned.length}</span>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mt-4 mb-2">Assignment Decisions</h3>
              {hungarianData.allocations.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No eligible patients or matching beds found.</p>
              ) : (
                <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {hungarianData.allocations.map((alloc: any, i: number) => (
                    <li key={i} className="p-3 border border-teal-100 rounded-md bg-teal-50/50 text-xs space-y-1">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-gray-900">{alloc.patientId.slice(-6)}</span>
                        <ChevronRight size={14} className="text-gray-400" />
                        <span className="font-bold text-[#0D6E6E]">{alloc.bedCode}</span>
                        <span className="text-gray-500">Cost: {alloc.score.toFixed(1)}</span>
                      </div>
                      <p className="text-gray-600 text-[11px]">{alloc.explanation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500 shadow-sm space-y-2">
          <p className="text-base font-medium text-gray-700">No comparison results generated yet.</p>
          <p className="text-xs text-gray-500">Click &quot;Run Both Solvers&quot; above to compute current real-time queue assignments through both algorithms.</p>
        </div>
      )}
    </div>
  );
}
