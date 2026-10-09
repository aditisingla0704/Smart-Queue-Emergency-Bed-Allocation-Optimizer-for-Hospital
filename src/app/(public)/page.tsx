import Link from 'next/link';
import { ArrowRight, ListOrdered, Bed, FileSignature, Activity } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-50 py-20 sm:py-28 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Prioritize emergency patients and assign beds faster, with every decision explained.
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              MedQueue helps hospital staff manage patient intake efficiently, optimizing bed allocations and providing a transparent audit trail for all operations.
            </p>
            <div>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 bg-[#0D6E6E] hover:bg-[#0F8A8A] text-white px-8 py-4 rounded-md text-lg font-medium transition-colors shadow-sm"
              >
                Log in to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Capabilities</h2>
            <p className="text-lg text-gray-600">Built to handle complex clinical workflows with speed and clarity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                <ListOrdered className="h-6 w-6 text-[#0D6E6E]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Priority Queue</h3>
              <p className="text-gray-600">
                Patients are sorted by clinical urgency, with wait time factored in so no one is overlooked.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                <Bed className="h-6 w-6 text-[#0D6E6E]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bed Allocation</h3>
              <p className="text-gray-600">
                The optimizer suggests the best available bed based on ward type, equipment, and isolation needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                <FileSignature className="h-6 w-6 text-[#0D6E6E]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Full Audit Trail</h3>
              <p className="text-gray-600">
                Every decision is logged: who approved it, when, and why.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                <Activity className="h-6 w-6 text-[#0D6E6E]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Updates</h3>
              <p className="text-gray-600">
                Bed status and queue changes appear on every screen as they happen.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
