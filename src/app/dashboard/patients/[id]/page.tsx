import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Activity, Clock, FileText, Bed } from 'lucide-react';

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Mock data
  const patient = {
    id,
    displayId: 'P-101',
    name: 'John Doe',
    age: 45,
    sex: 'Male',
    triageLevel: 1,
    status: 'WAITING',
    chiefComplaint: 'Severe chest pain radiating to left arm.',
    vitals: {
      hr: 110,
      bp: '160/95',
      temp: 37.2,
      o2: 94,
      rr: 22
    },
    waitStartTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    assignedBed: null
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/patients" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
      </div>

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
                  <p className="text-sm text-gray-500">{patient.displayId} &bull; {patient.age} yrs &bull; {patient.sex}</p>
                </div>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                  Triage Level {patient.triageLevel}
                </span>
              </div>
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
                <div className="font-bold text-lg text-gray-900">{patient.vitals.hr} <span className="text-xs font-normal">bpm</span></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">BP</div>
                <div className="font-bold text-lg text-gray-900">{patient.vitals.bp}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Temp</div>
                <div className="font-bold text-lg text-gray-900">{patient.vitals.temp} <span className="text-xs font-normal">C</span></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">SpO2</div>
                <div className="font-bold text-lg text-gray-900">{patient.vitals.o2}%</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">RR</div>
                <div className="font-bold text-lg text-gray-900">{patient.vitals.rr}</div>
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
                <span className="font-medium text-gray-900">{patient.status}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={16} className="mr-2" /> Waiting Since
                </div>
                <span className="font-medium text-gray-900">
                  {new Date(patient.waitStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Bed size={16} className="mr-2" /> Assigned Bed
                </div>
                <span className="font-medium text-gray-900">{patient.assignedBed || 'None'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full bg-[#0D6E6E] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[#0F8A8A] transition-colors">
                Update Status
              </button>
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                Edit Vitals
              </button>
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                Assign Bed Manually
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
