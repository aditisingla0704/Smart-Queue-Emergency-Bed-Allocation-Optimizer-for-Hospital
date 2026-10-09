'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function IntakePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError('Failed to submit intake form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Patient Intake</h1>
      </div>

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm font-medium text-green-800">Patient successfully registered to the queue.</p>
          </div>
          <button 
            onClick={() => setSuccess(false)}
            className="mt-2 text-sm text-green-700 underline font-medium hover:text-green-800"
          >
            Register another patient
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        
        {/* Basic Info */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Patient Name</label>
              <input type="text" id="name" name="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D6E6E] focus:ring-[#0D6E6E] sm:text-sm p-2 border" placeholder="Leave blank if unidentified" />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
              <input type="number" id="age" name="age" required min="0" max="150" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D6E6E] focus:ring-[#0D6E6E] sm:text-sm p-2 border" />
            </div>
            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
              <select id="sex" name="sex" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D6E6E] focus:ring-[#0D6E6E] sm:text-sm p-2 border bg-white">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Clinical Info */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Clinical Assessment</h2>
          
          <div>
            <label htmlFor="complaint" className="block text-sm font-medium text-gray-700">Chief Complaint</label>
            <textarea id="complaint" name="complaint" required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D6E6E] focus:ring-[#0D6E6E] sm:text-sm p-2 border"></textarea>
          </div>

          <div>
            <label htmlFor="triage" className="block text-sm font-medium text-gray-700 mb-2">Triage Level</label>
            <select id="triage" name="triage" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D6E6E] focus:ring-[#0D6E6E] sm:text-sm p-2 border bg-white">
              <option value="">Select Level...</option>
              <option value="1">Level 1 - Resuscitation (Immediate life-saving intervention)</option>
              <option value="2">Level 2 - Emergent (High risk, severe pain)</option>
              <option value="3">Level 3 - Urgent (Multiple resources required)</option>
              <option value="4">Level 4 - Less Urgent (One resource required)</option>
              <option value="5">Level 5 - Non-Urgent (No resources required)</option>
            </select>
          </div>
        </section>

        {/* Requirements */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Special Requirements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input id="isolation" name="isolation" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#0D6E6E] focus:ring-[#0D6E6E]" />
              <label htmlFor="isolation" className="ml-2 block text-sm text-gray-900">Requires Isolation</label>
            </div>
            <div className="flex items-center">
              <input id="infection" name="infection" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#0D6E6E] focus:ring-[#0D6E6E]" />
              <label htmlFor="infection" className="ml-2 block text-sm text-gray-900">High Infection Risk</label>
            </div>
          </div>
          
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Required Equipment</span>
            <div className="grid grid-cols-2 gap-2">
              {['Ventilator', 'Cardiac Monitor', 'Oxygen', 'IV Pump'].map((item) => (
                <div key={item} className="flex items-center">
                  <input id={`eq-${item}`} name={`equipment`} value={item} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#0D6E6E] focus:ring-[#0D6E6E]" />
                  <label htmlFor={`eq-${item}`} className="ml-2 block text-sm text-gray-900">{item}</label>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0D6E6E] hover:bg-[#0A5555] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D6E6E] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            {loading ? 'Submitting...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
}
