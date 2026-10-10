'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';

type Patient = {
  id: string;
  displayId: string;
  name: string;
  age: number;
  sex: string;
  triageLevel: number;
  status: string;
  waitTime: string;
};

type Saved = { status?: string; assignedBed?: string | null };

const BASE_PATIENTS: Patient[] = [
  { id: '1', displayId: 'P-101', name: 'John Doe', age: 45, sex: 'Male', triageLevel: 1, status: 'WAITING', waitTime: '12m' },
  { id: '2', displayId: 'P-102', name: 'Jane Smith', age: 32, sex: 'Female', triageLevel: 2, status: 'WAITING', waitTime: '45m' },
  { id: '3', displayId: 'P-103', name: 'Alice Johnson', age: 67, sex: 'Female', triageLevel: 3, status: 'ADMITTED', waitTime: '-' },
];

export default function PatientsPage() {
  const [saved, setSaved] = useState<Record<string, Saved>>({});
  const [query, setQuery] = useState('');

  useEffect(() => {
    const result: Record<string, Saved> = {};
    BASE_PATIENTS.forEach((p) => {
      try {
        const raw = localStorage.getItem(`patient-${p.id}`);
        if (raw) result[p.id] = JSON.parse(raw);
      } catch {}
    });
    setSaved(result);
  }, []);

  const patients = BASE_PATIENTS.map((p) => ({
    ...p,
    status: saved[p.id]?.status || p.status,
    bed: saved[p.id]?.assignedBed || null,
  })).filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.displayId.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>

        <div className="flex w-full sm:w-auto space-x-2">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#0D6E6E] focus:border-[#0D6E6E] sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <button className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demographics</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triage Level</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wait Time</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    No patients found.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.displayId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.age} yrs</div>
                      <div className="text-sm text-gray-500">{patient.sex}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Level {patient.triageLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.bed || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.waitTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/patients/${patient.id}`} className="text-[#0D6E6E] hover:text-[#0F8A8A]">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{patients.length}</span> of{' '}
            <span className="font-medium">{BASE_PATIENTS.length}</span> results
          </p>
        </div>
      </div>
    </div>
  );
}