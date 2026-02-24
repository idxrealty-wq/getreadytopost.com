"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const gradingCategories = [
  { icon: '🎣', title: 'Hook', description: 'Does your opening line stop a buyer mid-scroll? The first sentence is everything.', color: 'bg-blue-500/20 border-blue-400/40' },
  { icon: '🏠', title: 'Features', description: 'Are your key property details highlighted in a way that excites — not just informs?', color: 'bg-green-500/20 border-green-400/40' },
  { icon: '🌅', title: 'Lifestyle', description: 'Does your description paint a picture of what it feels like to actually live there?', color: 'bg-purple-500/20 border-purple-400/40' },
  { icon: '⚖️', title: 'Compliance', description: 'Is your language Fair Housing compliant and MLS-safe? One wrong word can cost you.', color: 'bg-red-500/20 border-red-400/40' },
  { icon: '📖', title: 'Flow', description: 'Is it easy to read? Short sentences, active voice, no walls of text.', color: 'bg-amber-500/20 border-amber-400/40' },
  { icon: '📣', title: 'Call to Action', description: 'Does it drive the buyer to schedule a showing — or just describe a house?', color: 'bg-pink-500/20 border-pink-400/40' },
];

export default function RateMyListingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [email, setEmail] = useState('');
  const [listing, setListing] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [error, setError] = useState('');

  const wordCount = listing.trim().split(/\s+/).filter(w => w).length;

  useEffect(() => {
    if (user) {
      fetchCreditBalance();
    }
  }, [user]);

  const fetchCreditBalance = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/credits/balance?userId=${user.uid}`);
      const data = await res.json();
      setCreditBalance(data.balance || 0);
    } catch (err) {
      console.error('Failed to fetch credit balance:', err);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Please sign in to submit a listing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        userId: user.uid,
        email,
        listingText: listing,
        wordCount,
        status: creditBalance && creditBalance > 0 ? 'pending_analysis' : 'pending_payment',
        createdAt: new Date().toISOString(),
      });

      setSubmissionId(docRef.id);

      // If user has credits, skip payment and go straight to deduct
      if (creditBalance && creditBalance > 0) {
        handleViewResults(docRef.id);
      } else {
        setShowPayment(true);
      }
    } catch (error) {
      setError('Error saving submission. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = () => {
    window.open('https://square.link/u/22tY4Rla', '_blank');
  };

  const handleViewResults = async (listingId?: string) => {
    if (!user) {
      setError('Please sign in to view results.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, listingId: listingId || submissionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to deduct credit.');
        return;
      }

      const data = await res.json();
      setCreditBalance(data.newBalance);
      router.push(`/listing/${listingId || submissionId}`);
    } catch (error) {
      setError('Error processing your request. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Sign In Required</h1>
          <p className="text-gray-300 mb-6">Please sign in to rate your listing.</p>
          <Link href="/" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Rate My Listing</h1>
          <p className="text-gray-300">Get instant feedback on your real estate listing</p>
          {creditBalance !== null && (
            <p className="text-yellow-400 font-semibold mt-2">Credits Available: {creditBalance}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {gradingCategories.map((cat, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${cat.color}`}>
              <div className="text-3xl mb-2">{cat.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
              <p className="text-gray-300 text-sm">{cat.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
          <label className="block text-white font-semibold mb-2">Your Listing Description</label>
          <textarea
            value={listing}
            onChange={(e) => setListing(e.target.value)}
            placeholder="Paste your listing description here..."
            className="w-full h-48 bg-slate-900 text-white border border-slate-600 rounded p-4 focus:outline-none focus:border-yellow-500"
          />
          <p className="text-gray-400 text-sm mt-2">Word count: {wordCount}</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded mb-6">{error}</div>}

        {!showPayment ? (
          <button
            onClick={handleSubmit}
            disabled={loading || !listing.trim()}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 text-black font-bold py-3 rounded-lg transition"
          >
            {loading ? 'Processing...' : creditBalance && creditBalance > 0 ? 'Analyze with Credit' : 'Continue to Payment'}
          </button>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Complete Payment</h2>
            <p className="text-gray-300 mb-6">Click below to complete your $19.99 payment and get your listing analysis.</p>
            <button
              onClick={handlePaymentClick}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition"
            >
              Pay $19.99
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
