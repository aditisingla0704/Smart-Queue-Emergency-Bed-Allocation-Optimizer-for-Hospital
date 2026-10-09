import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="font-bold text-xl tracking-tight text-[#0D6E6E] block mb-4">MedQueue</span>
            <p className="text-gray-600 text-sm max-w-md">
              A hospital smart queue and bed allocation system. Prioritize emergency patients and assign beds faster, with full transparency and auditability.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-gray-600 hover:text-[#0D6E6E]">Home</Link></li>
              <li><Link href="/how-it-works" className="text-sm text-gray-600 hover:text-[#0D6E6E]">How It Works</Link></li>
              <li><Link href="/features" className="text-sm text-gray-600 hover:text-[#0D6E6E]">Features</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-[#0D6E6E]">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-[#0D6E6E]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 hover:text-[#0D6E6E]">Terms and Conditions</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            &copy; {currentYear} MedQueue. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
