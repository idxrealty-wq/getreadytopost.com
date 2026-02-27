'use client';

import ShareButtons from '@/components/ShareButtons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function RateMyListingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [listing, setListing] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!listing.trim()) {
      setError('Please paste your listing description.');
      return;
    }

    setLoading(true);

    try {
      const submissionsRef = collection(db, 'submissions');
      const docRef = await addDoc(submissionsRef, {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || '',
        listing: listing.trim(),
        createdAt: new Date(),
        status: 'processing',
      });

      router.push(`/processing?id=${docRef.id}`);
    } catch (err) {
      console.error('Error submitting listing:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16">
      <ShareButtons
        url="https://getreadytopost.com/rate-my-listing"
        title="Rate My Listing - GetReadyToPost"
      />

      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Grade Your Listing</h1>
          <p className="text-2xl text-gray-200">Paste your MLS description below. Get instant feedback in 30 seconds.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 mb-16">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="listing" className="block text-white font-bold mb-4">
                Your Listing Description
              </label>
              <textarea
                id="listing"
                value={listing}
                onChange={(e) => setListing(e.target.value)}
                placeholder="Paste your full MLS listing description here..."
                rows={10}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#c9a227]"
              />
              <p className="text-gray-400 text-sm mt-2">Minimum 50 characters. Copy from your MLS listing.</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !listing.trim()}
              className="w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-4 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Grade My Listing'}
            </button>

            <p className="text-center text-gray-400 text-sm">
              {!user ? (
                <>
                  <Link href="/signin" className="text-[#c9a227] hover:text-[#e8c547] underline">
                    Sign in
                  </Link>
                  {' '}to save your results, or continue as a guest.
                </>
              ) : (
                `Logged in as ${user.email}`
              )}
            </p>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
            <div className="text-4xl font-bold text-[#c9a227] mb-4">1</div>
            <h3 className="text-white font-bold text-lg mb-2">Paste</h3>
            <p className="text-gray-300">Copy your MLS description and paste it above.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
            <div className="text-4xl font-bold text-[#c9a227] mb-4">2</div>
            <h3 className="text-white font-bold text-lg mb-2">Grade</h3>
            <p className="text-gray-300">Get instant AI feedback across 6 categories.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
            <div className="text-4xl font-bold text-[#c9a227] mb-4">3</div>
            <h3 className="text-white font-bold text-lg mb-2">Improve</h3>
            <p className="text-gray-300">Get a rewrite + actionable recommendations.</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What We Grade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Headline Impact</h3>
                <p className="text-gray-300">Does your title grab attention and include key keywords?</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Description Quality</h3>
                <p className="text-gray-300">Is your description clear, compelling, and buyer-focused?</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Keyword Optimization</h3>
                <p className="text-gray-300">Are you using the right keywords for search visibility?</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Emotional Appeal</h3>
                <p className="text-gray-300">Does your listing create desire and urgency?</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Call to Action</h3>
                <p className="text-gray-300">Do you have a clear, compelling next step for buyers?</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">MLS Compliance</h3>
                <p className="text-gray-300">Is your listing Fair Housing safe and MLS-compliant?</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Ready?</h2>
          <p className="text-xl text-gray-300 mb-8">Scroll up and paste your listing to get started.</p>
        </div>

        <div className="mt-16">
          <ShareButtons
            url="https://getreadytopost.com/rate-my-listing"
            title="Rate My Listing - GetReadyToPost"
          />
        </div>
      </div>
    </main>
  );
}
