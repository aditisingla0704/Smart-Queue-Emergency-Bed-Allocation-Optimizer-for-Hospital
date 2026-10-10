'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

type Suggestion = {
  id: string;
  patientName: string;
  triageLevel: number;
  waitTime: string;
  suggestedBed: string;
  optimizerMethod: string;
  explanation: string;
};

type HistoryRow = {
  time: string;
  patient: string;
  bed: string;
  actionBy: string;
};

const AVAILABLE_BEDS = ['ICU-01', 'ICU-02', 'ER-03', 'ER-04', 'GEN-05', 'GEN-06'];

const nowTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function AllocationsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: 'sugg-1',
      patientName: 'James Anderson',
      triageLevel: 1,
      waitTime: '5m',
      suggestedBed: 'ICU-01',
      optimizerMethod: 'Hungarian Algorithm',
      explanation: 'Highest acuity. ICU bed with cardiac monitor and oxygen selected.',
    },
    {
      id: 'sugg-2',
      patientName: 'Jane Smith',
      triageLevel: 2,
      waitTime: '45m',
      suggestedBed: 'ER-03',
      optimizerMethod: 'Hungarian Algorithm',
      explanation: 'Optimal match based on acuity and nearest free ER bed.',
    },
    {
      id: 'sugg-3',
      patientName: 'Robert Johnson',
      triageLevel: 2,
      waitTime: '30m',
      suggestedBed: 'ICU-02',
      optimizerMethod: 'Hungarian Algorithm',
      explanation: 'Needs oxygen support. ICU bed with oxygen available.',
    },
  ]);

  const [history, setHistory] = useState<HistoryRow[]>([
    { time: '10:45 AM', patient: 'John Doe', bed: 'GEN-01', actionBy: 'Auto (Hungarian)' },
  ]);

  const [overrideTarget, setOverrideTarget] = useState<Suggestion | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideBed, setOverrideBed] = useState(AVAILABLE_BEDS[0]);

  const handleConfirm = (s: Suggestion) => {
    setHistory((prev) => [
      { time: nowTime(), patient: s.patientName, bed: s.suggestedBed, actionBy: 'Confirmed (Hungarian)' },
      ...prev,
    ]);
    setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
  };

  const handleOverrideSubmit = () => {
    if (!overrideTarget || !overrideReason.trim()) return;
    setHistory((prev) => [
      {
        time: nowTime(),
        patient: overrideTarget.patientName,
        bed: overrideBed,
        actionBy: `Manual override: ${overrideReason.trim()}`,
      },
      ...prev,
    ]);
    setSuggestions((prev) => prev.filter((x) => x.id !== overrideTarget.id));
    setOverrideTarget(null);
    setOverrideReason('');
    setOverrideBed(AVAILABLE_BEDS[0]);
  };

  const closeModal = () => {
    setOverrideTarget(null);
    setOverrideReason('');
  };

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
          suggestions.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col"
            >
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
                  <p className="font-medium text-teal-800 mb-1 text-xs uppercase tracking-wider">
                    {s.optimizerMethod}
                  </p>
                  <p>{s.explanation}</p>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 flex space-x-3">
                <button
                  onClick={() => handleConfirm(s)}
                  className="flex-1 bg-[#0D6E6E] hover:bg-[#0F8A8A] text-white px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
                >
                  <Check size={16} className="mr-2" />
                  Confirm
                </button>
                <button
                  onClick={() => setOverrideTarget(s)}
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
              {history.map((h, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{h.patient}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{h.bed}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{h.actionBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {overrideTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Override Allocation</h3>
            <p className="text-sm text-gray-500 mb-4">
              {overrideTarget.patientName} (suggested {overrideTarget.suggestedBed})
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Assign bed manually</label>
            <select
              value={overrideBed}
              onChange={(e) => setOverrideBed(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
            >
              {AVAILABLE_BEDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for override</label>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring-[#0D6E6E] focus:border-[#0D6E6E]"
              rows={3}
              placeholder="E.g. Bed requires maintenance, patient needs isolation..."
            ></textarea>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
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