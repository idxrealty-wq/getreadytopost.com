"use client";
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Tab3Listing({ address, propertyData, nearby, listing, setListing, onNext, user }: any) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const generateListing = () => {
    if (!address) return;
    setLoading(true);
    fetch('/api/workspace/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, propertyDetails: propertyData }),
    })
      .then((res) => res.json())
      .then((data) => setListing(data.listing || 'Unable to generate listing.'))
      .catch(() => setListing('Failed to generate. Please try again.'))
      .finally(() => setLoading(false));
  };

  const copyListing = () => {
    if (listing) {
      navigator.clipboard.writeText(listing);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPreview = () => {
    if (!listing) return '';
    const sentences = listing.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 2).join(' ');
  };

  const handleUnlock = async () => {
    if (!user?.email && !user?.uid) {
      alert('Please sign in to unlock your full report.');
      return;
    }
    setSubmitting(true);
    try {
      const email = user.email || '';
      const docRef = await addDoc(collection(db, 'submissions'), {
        email,
        listingText: listing,
        wordCount: listing.trim().split(/\s+/).filter((w: string) => w).length,
        status: 'pending_payment',
        source: 'workspace',
        address,
        userId: user.uid || '',
        createdAt: new Date().toISOString(),
      });
      setSubmissionId(docRef.id);
      window.open('https://square.link/u/22tY4Rla', '_blank');
      setPaid(true);
    } catch (err) {
      alert('Error processing request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResults = () => {
    if (submissionId) {
      window.location.href = `/results?id=${submissionId}`;
    }
  };

  const preview = getPreview();

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">✨ AI Listing Builder</h2>
        <p className="text-gray-300 mb-6">Generate a professional, MLS-ready listing description using all your property and neighborhood data.</p>
        <button
          onClick={generateListing}
          disabled={loading || !address}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
        >
          {loading ? '⏳ Generating...' : listing ? '🔄 Regenerate Listing' : '✨ Generate A+ Listing'}
        </button>
      </div>

      {loading && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="w-12 h-12 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Crafting your A+ listing with real neighborhood data...</p>
        </div>
      )}

      {listing && !loading && (
        <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-emerald-500/40 relative overflow-hidden">
          <div className="absolute top-4 left-4 bg-red-500 text-white px-5 py-2 rounded-lg font-black text-2xl shadow-2xl transform -rotate-6">A+</div>
          <h2 className="text-2xl font-bold text-white mb-4 ml-20">Your Professional Listing</h2>

          {!paid ? (
            <>
              {/* Free Preview - first 2 sentences */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-4 relative">
                <p className="text-white text-lg leading-relaxed">{preview}</p>
                {/* Blurred rest */}
                <div className="relative mt-3">
                  <p className="text-white text-lg leading-relaxed blur-sm select-none opacity-60">
                    This stunning property features an open-concept layout with premium finishes throughout. The gourmet kitchen boasts quartz countertops and stainless steel appliances. Enjoy the spacious primary suite with walk-in closet and spa-like bathroom. Located minutes from top-rated schools, shopping, and dining. Schedule your private showing today before this gem is gone!
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/80 rounded-lg"></div>
                </div>
              </div>

              {/* Payment Gate */}
              <div className="bg-[#1a2b4a] border-2 border-[#c9a227] rounded-2xl p-6 text-center mt-4">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-white font-bold text-xl mb-2">Unlock Your Full Listing + Grade</h3>
                <p className="text-gray-300 text-sm mb-4">Get your complete AI-rewritten description, 6-category grade, and actionable recommendations.</p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl font-black text-[#c9a227]">$19.99</span>
                  <div className="text-left">
                    <p className="text-white text-sm font-bold">One-time payment</p>
                    <p className="text-gray-400 text-xs">Full report delivered instantly</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 text-sm">
                  <div className="bg-white/10 rounded-lg p-3 text-white">✅ Full rewritten listing</div>
                  <div className="bg-white/10 rounded-lg p-3 text-white">📊 6-category grade</div>
                  <div className="bg-white/10 rounded-lg p-3 text-white">💡 Recommendations</div>
                </div>
                <button
                  onClick={handleUnlock}
                  disabled={submitting}
                  className="w-full bg-[#c9a227] hover:bg-[#b8911f] text-white py-4 rounded-xl font-bold text-lg transition shadow-2xl disabled:opacity-50"
                >
                  {submitting ? '⏳ Processing...' : '🔓 Unlock Full Report — $19.99'}
                </button>
                <p className="text-gray-500 text-xs mt-3">Secure payment via Square. Report sent to your email instantly.</p>
              </div>
            </>
          ) : (
            <>
              {/* Post-payment state */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-4">
                <p className="text-white text-lg leading-relaxed">{preview}...</p>
              </div>
              <div className="bg-blue-900/40 border-2 border-blue-500/40 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">💳</div>
                <h3 className="text-white font-bold text-xl mb-2">Complete Your Payment</h3>
                <p className="text-gray-300 text-sm mb-4">After paying via Square, click below to see your full report.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => window.open('https://square.link/u/22tY4Rla', '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition"
                  >
                    Open Square Payment
                  </button>
                  <button
                    onClick={handleViewResults}
                    className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition"
                  >
                    ✨ View My Full Report
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-3">Results appear 30-60 seconds after payment is processed.</p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!listing}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
        >
          Next: Documents & Checklist →
        </button>
      </div>
    </div>
  );
}
