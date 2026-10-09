'use client';

import Link from 'next/link';
import { Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-[#0D6E6E] hover:text-[#0F8A8A] transition-colors">
              <Activity className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tight">MedQueue</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-[#0D6E6E] px-3 py-2 text-sm font-medium transition-colors">Home</Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-[#0D6E6E] px-3 py-2 text-sm font-medium transition-colors">How It Works</Link>
            <Link href="/features" className="text-gray-600 hover:text-[#0D6E6E] px-3 py-2 text-sm font-medium transition-colors">Features</Link>
            <Link href="/contact" className="text-gray-600 hover:text-[#0D6E6E] px-3 py-2 text-sm font-medium transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center">
            <Link 
              href="/login" 
              className="bg-[#0D6E6E] hover:bg-[#0F8A8A] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Log In
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-[#0D6E6E] focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" onClick={toggleMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#0D6E6E] hover:bg-gray-50 rounded-md">Home</Link>
            <Link href="/how-it-works" onClick={toggleMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#0D6E6E] hover:bg-gray-50 rounded-md">How It Works</Link>
            <Link href="/features" onClick={toggleMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#0D6E6E] hover:bg-gray-50 rounded-md">Features</Link>
            <Link href="/contact" onClick={toggleMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#0D6E6E] hover:bg-gray-50 rounded-md">Contact</Link>
            <Link href="/login" onClick={toggleMobileMenu} className="block px-3 py-2 mt-4 text-base font-medium bg-[#0D6E6E] text-white hover:bg-[#0F8A8A] rounded-md text-center">Log In</Link>
          </div>
        </div>
      )}
    </header>
  );
}
