"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function RateMyListingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [listing, setListing] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
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

      setSubmissionId(docRef.id);
      setShowPayment(true);
    } catch (error) {
      alert('Error saving submission. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = () => {
    window.open('https://square.link/u/22tY4Rla', '_blank');
  };

  const handleViewResults = () => {
    router.push(`/results?id=${submissionId}`);
  };

  return (
    <main className="pt-20 min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img
          src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/1c6b6e83-767a-4a5f-9cc4-ea33a9ca148a/image.png?w=1200&h=896"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1a2b4a]/85"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
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

        {showPayment ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Complete Your Payment</h2>
            <p className="text-gray-600 mb-6">Complete these 2 steps:</p>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#c9a227] text-white flex items-center justify-center font-bold">1</div>
                  <h3 className="font-bold text-gray-800">Pay $19.99 via Square</h3>
                </div>
                <button
                  onClick={handlePaymentClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Open Square Payment
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">2</div>
                  <h3 className="font-bold text-gray-800">View Your Results</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">After completing payment, click below to see your instant analysis</p>
                <button
                  onClick={handleViewResults}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  ✨ View My Results
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500">Your results will appear instantly after payment is processed (usually 30-60 seconds)</p>
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
                {loading ? 'Saving...' : '🔥 Continue to Payment'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Secure payment via Square. See results instantly.
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
