import React from 'react';
import { Info, Calculator, ShieldAlert, Clock, Stethoscope } from 'lucide-react';

export default function HowPriorityWorksPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How Prioritization Works</h1>
        <p className="text-gray-600">A detailed explanation of the MedQueue algorithmic scoring system.</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Calculator className="text-[#0D6E6E]" size={24} />
            <h2 className="text-xl font-bold text-gray-900">The Scoring Formula</h2>
          </div>
        </div>
        <div className="p-6 text-gray-700 space-y-4">
          <p>
            MedQueue uses a dynamic Priority Score to order patients in the queue. 
            The score is calculated in real-time based on several factors, ensuring that the sickest patients 
            are seen first, while also preventing patients with lower acuity from waiting indefinitely.
          </p>
          <div className="bg-gray-50 p-4 rounded-md font-mono text-sm text-center border border-gray-200 my-4">
            Total Score = Triage Base Score + Aging Factor + Clinical Flags
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 text-[#0D6E6E]">
            <Stethoscope size={20} />
            <h3 className="font-bold text-gray-900">1. Triage Base</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">The initial score assigned based on standard CTAS/ESI levels.</p>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between border-b pb-1"><span>Level 1 (Resuscitation)</span> <span className="font-mono font-bold">1000</span></li>
            <li className="flex justify-between border-b pb-1"><span>Level 2 (Emergent)</span> <span className="font-mono font-bold">80</span></li>
            <li className="flex justify-between border-b pb-1"><span>Level 3 (Urgent)</span> <span className="font-mono font-bold">60</span></li>
            <li className="flex justify-between border-b pb-1"><span>Level 4 (Less Urgent)</span> <span className="font-mono font-bold">40</span></li>
            <li className="flex justify-between pb-1"><span>Level 5 (Non-Urgent)</span> <span className="font-mono font-bold">20</span></li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 text-[#0D6E6E]">
            <Clock size={20} />
            <h3 className="font-bold text-gray-900">2. Aging Factor</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Score increases incrementally based on wait time to prevent starvation.</p>
          <div className="bg-gray-50 p-3 rounded border border-gray-100 text-sm">
            <p className="font-semibold mb-1">Calculation:</p>
            <p className="font-mono text-xs">(Wait Minutes / 10) × Multiplier</p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Note: Higher triage levels accumulate aging points faster to ensure they remain at the top.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 text-[#0D6E6E]">
            <ShieldAlert size={20} />
            <h3 className="font-bold text-gray-900">3. Clinical Flags</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Additional points applied for specific clinical risks or conditions.</p>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between border-b pb-1"><span>Abnormal Vitals</span> <span className="font-mono font-bold text-red-600">+15</span></li>
            <li className="flex justify-between border-b pb-1"><span>Infection Risk</span> <span className="font-mono font-bold text-red-600">+10</span></li>
            <li className="flex justify-between pb-1"><span>Age &gt; 65</span> <span className="font-mono font-bold text-red-600">+5</span></li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Estimated Wait Time (EWT)</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The estimated wait time shown to patients is calculated based on their position in the queue, 
                current hospital staffing levels, and historical processing times. This is a prediction, not a guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
