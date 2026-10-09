export default function PrivacyPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: October 2026</p>

        <div className="prose prose-teal max-w-none text-gray-700">
          <p className="mb-6 font-semibold bg-gray-50 p-4 border-l-4 border-[#0D6E6E] text-gray-900">
            Academic Disclaimer: This is an academic project and is not a certified clinical system. It should not be used for actual patient care without proper clinical validation and regulatory approval.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            This Privacy Policy details how MedQueue collects, uses, and protects information when you use our system. By accessing MedQueue, you agree to the collection and use of information in accordance with this policy.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. What Data is Collected</h2>
          <p className="mb-4">
            We collect the following types of information:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>User Accounts:</strong> Names, email addresses, and roles of hospital staff accessing the system.</li>
            <li><strong>Patient Records:</strong> Demographics, clinical urgency levels, and requirements necessary for queue management and bed allocation.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Purpose of Collection</h2>
          <p className="mb-4">
            The data collected is used strictly for the purpose of hospital queue and bed management. This includes calculating priority scores, suggesting appropriate bed assignments, and maintaining an audit log of operational decisions.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Data Retention</h2>
          <p className="mb-4">
            Data is retained for as long as needed for hospital operations and audit purposes. Administrative staff can configure automated archival or deletion rules based on institutional policies.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Security Measures</h2>
          <p className="mb-4">
            We implement strict security protocols to protect the data, including:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Encrypted passwords for all user accounts.</li>
            <li>Role-based access control to limit visibility to authorized personnel only.</li>
            <li>HTTPS encryption for all data transmitted between the client and server.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. User Rights</h2>
          <p className="mb-4">
            Users have the right to request access to, correction of, or deletion of their personal data. Such requests can be made through the system administrators or by contacting the development team.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Cookies</h2>
          <p className="mb-4">
            MedQueue uses strictly necessary session cookies to maintain user authentication and security. We do not use tracking or advertising cookies.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:{' '}
            <a href="mailto:medqueue@example.com" className="text-[#0D6E6E] hover:underline">
              medqueue@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
