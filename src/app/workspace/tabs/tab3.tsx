"use client";
import { useState } from 'react';

export default function Tab3Listing({ address, propertyData, nearby, listing, setListing, onNext }: any) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateListing = () => {
    if (!address) return;
    setLoading(true);

    fetch('/api/workspace/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        propertyDetails: propertyData,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setListing(data.listing || 'Unable to generate listing.');
      })
      .catch(() => {
        setListing('Failed to generate. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  const copyListing = () => {
    if (listing) {
      navigator.clipboard.writeText(listing);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-emerald-500/40 relative">
          <div className="absolute top-4 left-4 bg-red-500 text-white px-5 py-2 rounded-lg font-black text-2xl shadow-2xl transform -rotate-6">
            A+
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 ml-20">Your Professional Listing</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-4">
            <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{listing}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={copyListing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition"
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>
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
