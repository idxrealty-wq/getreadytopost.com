"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function RateMyListingPage() {
  const [email, setEmail] = useState('');
  const [listing, setListing] = useState('');
  const wordCount = listing.trim().split(/\s+/).filter(w => w).length;

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <section className="py-8 text-center text-white">
          <div className="max-w-2xl mx-auto px-6">
            <div className="inline-block bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">🔥 Instant Listing Analysis</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Rate My Listing</h1>
            <p className="text-gray-300">Grade → Polish → Copy. All in one place.</p>
          </div>
        </section>

        <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
          <h2 className="font-bold text-[#1a2b4a] mb-4">1. Paste Your Listing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                placeholder="you@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing Description *</label>
              <textarea 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                placeholder="Paste your MLS listing description here..."
                rows={6}
                value={listing}
                onChange={(e) => setListing(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">{wordCount} words</p>
            </div>
            <button 
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50"
              disabled={!email || !listing}
            >
              🔥 Grade My Listing
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-white/70 hover:text-white font-semibold">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
