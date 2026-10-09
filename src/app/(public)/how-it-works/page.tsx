import { ClipboardType, Calculator, BedDouble, UserCheck } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How It Works</h1>
          <p className="mt-4 text-xl text-gray-600">
            A structured workflow for managing hospital queues and bed assignments.
          </p>
        </div>

        <div className="space-y-12">
          {/* Step 1 */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-[#0D6E6E] text-white rounded-full flex items-center justify-center shadow-md">
              <ClipboardType className="h-8 w-8" />
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">1. Triage</h3>
              <p className="text-lg text-gray-600">
                A triage nurse registers the patient and assigns a clinical urgency level (1 to 5).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-[#0D6E6E] text-white rounded-full flex items-center justify-center shadow-md">
              <Calculator className="h-8 w-8" />
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">2. Queue</h3>
              <p className="text-lg text-gray-600">
                The system calculates a priority score based on urgency, wait time, and clinical flags. Critical patients are seen first.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-[#0D6E6E] text-white rounded-full flex items-center justify-center shadow-md">
              <BedDouble className="h-8 w-8" />
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">3. Bed Assignment</h3>
              <p className="text-lg text-gray-600">
                When a patient needs admission, the optimizer finds the best available bed that matches their clinical needs.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-[#0D6E6E] text-white rounded-full flex items-center justify-center shadow-md">
              <UserCheck className="h-8 w-8" />
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">4. Human Confirmation</h3>
              <p className="text-lg text-gray-600">
                A bed manager reviews and confirms every suggestion. Overrides are logged with a reason.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
