'use client';

import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">Contact</h1>
          <p className="text-lg text-gray-600 mb-6">
            MedQueue is an academic project. For questions or feedback, reach out to the development team.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Mail className="h-5 w-5 text-[#0D6E6E]" />
            <a href="mailto:medqueue@example.com" className="hover:text-[#0D6E6E] font-medium">
              medqueue@example.com
            </a>
          </div>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-sm">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-[#0D6E6E]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent</h2>
              <p className="text-gray-600">
                Thank you for reaching out. We will get back to you shortly.
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="mt-8 text-[#0D6E6E] hover:text-[#0F8A8A] font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#0D6E6E] focus:border-[#0D6E6E]"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#0D6E6E] focus:border-[#0D6E6E]"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#0D6E6E] focus:border-[#0D6E6E]"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#0D6E6E] hover:bg-[#0F8A8A] text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
