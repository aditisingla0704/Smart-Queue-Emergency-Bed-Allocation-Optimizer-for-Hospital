'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Activity, Clock, Bed } from 'lucide-react';

type Vitals = { hr: number; bp: string; temp: number; o2: number; rr: number };
type Modal = null | 'status' | 'vitals' | 'bed';

const BEDS = ['ICU-01', 'ICU-02', 'ER-03', 'ER-04', 'GEN-05', 'GEN-06'];
const STATUSES = ['WAITING', 'IN_TREATMENT', 'ADMITTED', 'DISCHARGED'];

const PATIENTS: Record<
  string,
  {
    displayId: string;
    name: string;
    age: number;
    sex: string;
    triageLevel: number;
    status: string;
    chiefComplaint: string;
    vitals: Vitals;
  }
> = {
  '1': {
    displayId: 'P-101',
    name: 'John Doe',
    age: 45,
    sex: 'Male',
    triageLevel: 1,
    status: 'WAITING',
    chiefComplaint: 'Severe chest pain radiating to left arm.',
    vitals: { hr: 110, bp: '160/95', temp: 37.2, o2: 94, rr: 22 },
  },
  '2': {
    displayId: 'P-102',
    name: 'Jane Smith',
    age: 32,
    sex: 'Female',
    triageLevel: 2,
    status: 'WAITING',
    chiefComplaint: 'Abdominal pain since last night.',
    vitals: { hr: 88, bp: '120/80', temp: 37.5, o2: 98, rr: 18 },
  },
  '3': {
    displayId: 'P-103',
    name: 'Alice Johnson',
    age: 67,
    sex: 'Female',
    triageLevel: 3,
    status: 'ADMITTED',
    chiefComplaint: 'Fall at home, hip pain.',
    vitals: { hr: 76, bp: '135/85', temp: 36.9, o2: 96, rr: 16 },
  },
};

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = PATIENTS[id] ?? PATIENTS['1'];
  const storageKey = `patient-${id}`;

  const [waitStart, setWaitStart] = useState('');
  const [status, setStatus] = useState(patient.status);
  const [assignedBed, setAssignedBed] = useState<string | null>(null);
  const [vitals, setVitals] = useState<Vitals>(patient.vitals);
  const [loaded, setLoaded] = useState(false);

  const [modal, setModal] = useState<Modal>(null);
  const [statusDraft, setStatusDraft] = useState(patient.status);
  const [bedDraft, setBedDraft] = useState(BEDS[0]);
  const [vitalsDraft, setVitalsDraft] = useState({ hr: '', bp: '', temp: '', o2: '', rr: '' });
  const [message, setMessage] = useState('');

  // Load saved changes from the browser
  useEffect(() => {
    setWaitStart(new Date(Date.now() - 1000 * 60 * 45).toISOString());
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.status) setStatus(d.status);
        if (d.assignedBed) setAssignedBed(d.assignedBed);
        if (d.vitals) setVitals(d.vitals);
      }
    } catch {}
    setLoaded(true);
  }, [storageKey]);

  // Save changes to the browser
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ status, assignedBed, vitals }));
    } catch {}
  }, [loaded, storageKey, status, assignedBed, vitals]);

  const openStatus = () => {
    setStatusDraft(status);
    setModal('status');
  };

  const openVitals = () => {
    setVitalsDraft({
      hr: String(vitals.hr),
      bp: vitals.bp,
      temp: String(vitals.temp),
      o2: String(vitals.o2),
      rr: String(vitals.rr),
    });
    setModal('vitals');
  };

  const openBed = () => {
    setBedDraft(assignedBed || BEDS[0]);
    setModal('bed');
  };

  const saveStatus = () => {
    setStatus(statusDraft);
    setMessage(`Status updated to ${statusDraft}`);
    setModal(null);
  };

  const saveVitals = () => {
    setVitals({
      hr: Number(vitalsDraft.hr) || 0,
      bp: vitalsDraft.bp,
      temp: Number(vitalsDraft.temp) || 0,
      o2: Number(vitalsDraft.o2) || 0,
      rr: Number(vitalsDraft.rr) || 0,
    });
    setMessage('Vitals updated');
    setModal(null);
  };

  const saveBed = () => {
    setAssignedBed(bedDraft);
    setStatus('ADMITTED');
    setMessage(`Bed ${bedDraft} assigned manually`);
    setModal(null);
  };

  const inputClass = 'w-full border border-gray-300 rounded-md p-2 mb-3';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/patients" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
      </div>

      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 text-sm text-green-800 flex justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold">
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-800">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{patient.name}</h2>
                  <p className="text-sm text-gray-500">
                    {patient.displayId} &bull; {patient.age} yrs &bull; {patient.sex}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                Triage Level {patient.triageLevel}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Chief Complaint</h3>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-md border border-gray-100">
                {patient.chiefComplaint}
              </p>
            </div>
          </div>

          {/* Vitals */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="text-gray-500" size={20} />
              <h3 className="text-lg font-bold text-gray-900">Current Vitals</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">HR</div>
                <div className="font-bold text-lg text-gray-900">
                  {vitals.hr} <span className="text-xs font-normal">bpm</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">BP</div>
                <div className="font-bold text-lg text-gray-900">{vitals.bp}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Temp</div>
                <div className="font-bold text-lg text-gray-900">
                  {vitals.temp} <span className="text-xs font-normal">C</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">SpO2</div>
                <div className="font-bold text-lg text-gray-900">{vitals.o2}%</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">RR</div>
                <div className="font-bold text-lg text-gray-900">{vitals.rr}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Status & Actions */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status Information</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Activity size={16} className="mr-2" /> Current Status
                </div>
                <span className="font-medium text-gray-900">{status}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={16} className="mr-2" /> Waiting Since
                </div>
                <span className="font-medium text-gray-900">
                  {waitStart
                    ? new Date(waitStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Bed size={16} className="mr-2" /> Assigned Bed
                </div>
                <span className="font-medium text-gray-900">{assignedBed || 'None'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={openStatus}
                className="w-full bg-[#0D6E6E] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[#0F8A8A] transition-colors"
              >
                Update Status
              </button>
              <button
                onClick={openVitals}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Edit Vitals
              </button>
              <button
                onClick={openBed}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Assign Bed Manually
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            {modal === 'status' && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Update Status</h3>
                <label className={labelClass}>New status</label>
                <select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)} className={inputClass}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </>
            )}

            {modal === 'vitals' && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Vitals</h3>
                <label className={labelClass}>Heart rate (bpm)</label>
                <input
                  value={vitalsDraft.hr}
                  onChange={(e) => setVitalsDraft({ ...vitalsDraft, hr: e.target.value })}
                  className={inputClass}
                />
                <label className={labelClass}>Blood pressure</label>
                <input
                  value={vitalsDraft.bp}
                  onChange={(e) => setVitalsDraft({ ...vitalsDraft, bp: e.target.value })}
                  className={inputClass}
                />
                <label className={labelClass}>Temperature (C)</label>
                <input
                  value={vitalsDraft.temp}
                  onChange={(e) => setVitalsDraft({ ...vitalsDraft, temp: e.target.value })}
                  className={inputClass}
                />
                <label className={labelClass}>SpO2 (%)</label>
                <input
                  value={vitalsDraft.o2}
                  onChange={(e) => setVitalsDraft({ ...vitalsDraft, o2: e.target.value })}
                  className={inputClass}
                />
                <label className={labelClass}>Respiratory rate</label>
                <input
                  value={vitalsDraft.rr}
                  onChange={(e) => setVitalsDraft({ ...vitalsDraft, rr: e.target.value })}
                  className={inputClass}
                />
              </>
            )}

            {modal === 'bed' && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Assign Bed Manually</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {patient.name} ({patient.displayId})
                </p>
                <label className={labelClass}>Select bed</label>
                <select value={bedDraft} onChange={(e) => setBedDraft(e.target.value)} className={inputClass}>
                  {BEDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="flex justify-end space-x-3 mt-2">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={modal === 'status' ? saveStatus : modal === 'vitals' ? saveVitals : saveBed}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0D6E6E] rounded-md hover:bg-[#0F8A8A]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}