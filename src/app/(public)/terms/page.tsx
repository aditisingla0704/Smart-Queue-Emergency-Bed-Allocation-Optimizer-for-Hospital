export default function TermsPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms and Conditions</h1>
        <p className="text-gray-500 mb-8">Last updated: October 2026</p>

        <div className="prose prose-teal max-w-none text-gray-700">
          <p className="mb-6 font-semibold bg-gray-50 p-4 border-l-4 border-[#0D6E6E] text-gray-900">
            Academic Disclaimer: This is an academic project and is not a certified clinical system. It should not be used for actual patient care without proper clinical validation and regulatory approval.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using MedQueue, you accept and agree to be bound by the terms and provisions of this agreement.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            MedQueue provides a web-based smart queue and bed allocation system designed to optimize hospital workflows. The system includes features for patient triage, priority queuing, bed assignment recommendations, and audit logging.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts and Responsibilities</h2>
          <p className="mb-4">
            Users must be authorized hospital staff. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to enter accurate clinical and operational data to the best of your ability.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall the developers of MedQueue be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of this system. Decisions made using this system remain the responsibility of the clinical and administrative staff.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. No Warranty</h2>
          <p className="mb-4">
            This service is provided "as is" and "as available" without any warranties of any kind, either express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, or non-infringement. This system is provided for academic demonstration purposes.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Governing Law</h2>
          <p className="mb-4">
            These terms shall be governed by and construed in accordance with standard academic project guidelines, as this is a demonstration system not intended for commercial deployment.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Any changes will be effective immediately upon posting to this page, with the updated date noted at the top.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Contact Information</h2>
          <p className="mb-4">
            For any questions regarding these Terms and Conditions, please contact us at:{' '}
            <a href="mailto:medqueue@example.com" className="text-[#0D6E6E] hover:underline">
              medqueue@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
