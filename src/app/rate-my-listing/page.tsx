"use client";
import { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function RateMyListingPage() {
  const [email, setEmail] = useState('');
  const [listing, setListing] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const wordCount = listing.trim().split(/\s+/).filter(w => w).length;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        email,
        listingText: listing,
        wordCount,
        status: 'pending_payment',
        createdAt: new Date().toISOString(),
      });

      window.open(`https://square.link/u/22tY4Rla?note=GRTP_${docRef.id}`, '_blank');
      setShowSuccess(true);
    } catch (error) {
      alert('Error saving submission. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <section className="py-8 text-center text-white">
          <div className="max-w-2xl mx-auto px-6">
            <div className="inline-block bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">🔥 Instant Listing Analysis</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Rate My Listing</h1>
            <p className="text-gray-300 mb-4">Grade → Rewrite → Report. All in one place.</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
              <p className="text-4xl font-bold text-[#c9a227] mb-1">$19.99</p>
              <p className="text-sm text-gray-300">Instant AI-powered analysis</p>
            </div>
          </div>
        </section>

        {showSuccess ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Complete Your Payment</h2>
            <p className="text-gray-600 mb-6">A payment window opened. After you complete payment, your report will be generated automatically and emailed to <strong>{email}</strong> within 1-2 minutes.</p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <p className="text-sm text-blue-800"><strong>What happens next:</strong></p>
              <ol className="text-left text-sm text-blue-700 mt-3 space-y-2">
                <li>1. Complete payment in the Square window</li>
                <li>2. You'll receive a confirmation email immediately</li>
                <li>3. Your listing analysis will be generated (30-60 seconds)</li>
                <li>4. Full report with grade + rewrite arrives in your inbox</li>
              </ol>
            </div>
            <button 
              onClick={() => { setShowSuccess(false); setEmail(''); setListing(''); }}
              className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
            >
              ← Submit Another Listing
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                  placeholder="you@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Your report will be sent here</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Description *</label>
                <textarea 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                  placeholder="Paste your MLS listing description here..."
                  rows={8}
                  value={listing}
                  onChange={(e) => setListing(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">{wordCount} words</p>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50"
                disabled={!email || !listing || loading}
              >
                {loading ? 'Saving...' : '🔥 Pay $19.99 & Get My Report'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Secure payment via Square. Report delivered automatically to your email.
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="text-white/70 hover:text-white font-semibold">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
