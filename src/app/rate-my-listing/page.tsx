"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function RateMyListingPage() {
  const [email, setEmail] = useState('');
  const [listing, setListing] = useState('');
  const [step, setStep] = useState<'input' | 'payment' | 'processing' | 'success' | 'error'>('input');
  const [errorMsg, setErrorMsg] = useState('');
  
  const wordCount = listing.trim().split(/\s+/).filter(w => w).length;

  const handleAnalyze = async () => {
    setStep('processing');
    setErrorMsg('');

    try {
      const response = await fetch('/api/submit-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, listingText: listing }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      setStep('success');
    } catch (error: any) {
      setStep('error');
      setErrorMsg(error.message);
    }
  };

  const handlePayAndAnalyze = () => {
    // Save listing data to localStorage so we can retrieve after payment
    localStorage.setItem('rml_email', email);
    localStorage.setItem('rml_listing', listing);
    // Open Square payment link
    window.open('https://square.link/u/22tY4Rla', '_blank');
    // Show processing step
    setStep('payment');
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

        {step === 'success' ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Report Sent!</h2>
            <p className="text-green-700 mb-4">Check your email for your full listing analysis, grade, and rewrite.</p>
            <button onClick={() => { setStep('input'); setEmail(''); setListing(''); }} className="bg-[#c9a227] hover:bg-[#e8c547] text-white px-6 py-3 rounded-lg font-semibold">
              Analyze Another Listing
            </button>
          </div>
        ) : step === 'payment' ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-5xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Complete Your Payment</h2>
            <p className="text-gray-600 mb-6">A new window opened for secure payment via Square. After you complete the payment, click the button below.</p>
            <button 
              onClick={handleAnalyze}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition mb-4"
            >
              ✅ I've Completed Payment — Run My Analysis
            </button>
            <button 
              onClick={() => setStep('input')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Go back
            </button>
          </div>
        ) : step === 'processing' ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-5xl mb-4 animate-spin">⏳</div>
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Analyzing Your Listing...</h2>
            <p className="text-gray-600">Grading, rewriting, and building your report. This takes about 15-30 seconds.</p>
          </div>
        ) : step === 'error' ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-700 mb-4">Something Went Wrong</h2>
            <p className="text-gray-600 mb-4">{errorMsg}</p>
            <button 
              onClick={() => setStep('input')}
              className="bg-[#c9a227] hover:bg-[#e8c547] text-white px-6 py-3 rounded-lg font-semibold"
            >
              Try Again
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
                onClick={handlePayAndAnalyze}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50"
                disabled={!email || !listing}
              >
                🔥 Pay $19.99 & Get My Report
              </button>

              <p className="text-xs text-gray-500 text-center">
                Secure payment via Square. Report delivered instantly to your email.
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
