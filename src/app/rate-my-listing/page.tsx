"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';

declare global {
  interface Window {
    Square?: any;
  }
}

export default function RateMyListingPage() {
  const [email, setEmail] = useState('');
  const [listing, setListing] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [card, setCard] = useState<any>(null);
  const [squareLoaded, setSquareLoaded] = useState(false);
  
  const wordCount = listing.trim().split(/\s+/).filter(w => w).length;

  useEffect(() => {
    if (squareLoaded && window.Square) {
      initializeSquare();
    }
  }, [squareLoaded]);

  async function initializeSquare() {
    try {
      const payments = window.Square.payments('sq0idp-oOrvgolD7-O8UGUNWEw4qQ');
      const cardInstance = await payments.card();
      await cardInstance.attach('#card-container');
      setCard(cardInstance);
    } catch (error) {
      console.error('Square initialization error:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) {
      setErrorMsg('Payment form not loaded. Please refresh the page.');
      return;
    }

    setStatus('processing');
    setErrorMsg('');

    try {
      const tokenResult = await card.tokenize();
      if (tokenResult.status !== 'OK') {
        throw new Error('Payment tokenization failed');
      }

      const response = await fetch('/api/submit-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          listingText: listing,
          paymentSourceId: tokenResult.token,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }

      setStatus('success');
      setEmail('');
      setListing('');
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message);
    }
  };

  return (
    <>
      <Script
        src="https://web.squarecdn.com/v1/square.js"
        onLoad={() => setSquareLoaded(true)}
      />
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

          {status === 'success' ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Report Sent!</h2>
              <p className="text-green-700 mb-4">Check your email for your full listing analysis and rewrite.</p>
              <button onClick={() => setStatus('idle')} className="bg-[#c9a227] hover:bg-[#e8c547] text-white px-6 py-3 rounded-lg font-semibold">
                Analyze Another Listing
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
              <form onSubmit={handleSubmit}>
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
                      disabled={status === 'processing'}
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
                      disabled={status === 'processing'}
                    />
                    <p className="text-sm text-gray-500 mt-1">{wordCount} words</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Information *</label>
                    <div id="card-container" className="border-2 border-gray-200 rounded-xl p-4 min-h-[60px]"></div>
                  </div>

                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50"
                    disabled={!email || !listing || status === 'processing' || !squareLoaded}
                  >
                    {status === 'processing' ? '⏳ Processing...' : '🔥 Pay $19.99 & Get My Report'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Secure payment via Square. Report delivered instantly to your email.
                  </p>
                </div>
              </form>
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/" className="text-white/70 hover:text-white font-semibold">← Back to Home</Link>
          </div>
        </div>
      </main>
    </>
  );
}
