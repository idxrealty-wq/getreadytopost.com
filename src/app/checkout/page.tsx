"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

const BG_URL = "https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/e2af6091-9b63-4698-8f57-f02cfe21cfc7/image.png?w=1200&h=896";

const packages = [
  { id: 'single', name: 'Single', credits: 1, price: 19.99, description: 'One listing analysis' },
  { id: '5pack', name: '5-Pack', credits: 5, price: 85, description: '5 analyses' },
  { id: 'monthly', name: 'Monthly', credits: 99, price: 99, description: 'Unlimited 30 days' },
  { id: '6month', name: '6-Month', credits: 495, price: 495, description: 'Unlimited 6 months' },
  { id: 'annual', name: 'Annual', credits: 899, price: 899, description: 'Unlimited 12 months' },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();
  
  const pkgParam = searchParams.get('pkg');
  const initialPkg = packages.find(p => p.id === pkgParam) || packages[0];
  
  const [selectedPackage, setSelectedPackage] = useState(initialPkg);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/credits/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType: selectedPackage.id,
          email,
          userId: user?.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create checkout');
        return;
      }

      window.location.href = data.checkout_url;
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Sign In Required</h1>
          <p className="text-gray-300 mb-6">Please sign in to purchase credits.</p>
          <button onClick={() => router.push('/')} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div className="fixed inset-0 z-0">
        <img src={BG_URL} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0b1220]/75" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="mb-8 text-gray-300 hover:text-white transition">
          ← Back
        </button>

        <div className="bg-slate-900/55 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-2">Buy Credits</h1>
          <p className="text-gray-300 mb-10">Select a plan and complete your purchase</p>

          {error && (
            <div className="mb-8 bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-10">
            <div>
              <label className="block text-white font-bold text-lg mb-6">Select Your Plan</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-6 rounded-xl border-2 transition text-left ${
                      selectedPackage.id === pkg.id
                        ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <h3 className="text-white font-bold text-lg mb-1">{pkg.name}</h3>
                    <p className="text-gray-300 text-sm mb-3">{pkg.description}</p>
                    <div className="flex justify-between items-end">
                      <span className="text-gray-200 text-sm">{pkg.credits} credits</span>
                      <span className="text-yellow-400 font-bold text-xl">${pkg.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-bold mb-3">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-black/30 border border-white/10 text-white rounded-lg px-4 py-3 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                required
              />
            </div>

            <div className="bg-black/25 border border-white/10 rounded-xl p-6">
              <div className="flex justify-between text-gray-200 mb-4">
                <span>{selectedPackage.name} Package</span>
                <span>${selectedPackage.price.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-yellow-400 font-bold text-2xl">${selectedPackage.price.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 text-black font-bold py-4 rounded-lg transition text-lg"
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>

            <p className="text-center text-gray-300 text-sm">
              Secure payment powered by Square.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
