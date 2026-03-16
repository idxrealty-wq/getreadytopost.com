'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

const BG_URL =
  'https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/e2af6091-9b63-4698-8f57-f02cfe21cfc7/image.png?w=1200&h=896';

const packages = [
  {
    id: 'single',
    name: 'Single',
    credits: 1,
    price: 19.99,
    description: 'One property pull',
    type: 'one-time',
    features: ['1 property pull', 'Rate My Listing', 'Never expires'],
  },
  {
    id: '5pack',
    name: '5-Pack',
    credits: 5,
    price: 85,
    description: '5 property pulls',
    type: 'one-time',
    features: ['5 property pulls', '$17 per pull', 'Never expires'],
  },
  {
    id: 'monthly',
    name: 'Monthly',
    credits: 30,
    price: 30,
    description: '30 credits/month',
    type: 'subscription',
    features: ['30 credits/month', 'Property pulls @ $3', 'Agent Vault', 'Workspace', 'Cancel anytime'],
    billingCycle: 'monthly',
  },
  {
    id: 'semi-annual',
    name: 'Semi-Annual',
    credits: 300,
    price: 495,
    description: '300 credits/6 months',
    type: 'subscription',
    features: ['300 credits total', 'Property pulls @ $2.50', 'Agent Vault', 'Workspace', '6-month term'],
    billingCycle: 'semi-annual',
  },
  {
    id: 'annual',
    name: 'Annual',
    credits: 450,
    price: 899,
    description: '450 credits/year',
    type: 'subscription',
    features: ['450 credits/year', 'Property pulls @ $1.75', 'Agent Vault', 'Workspace', 'Full year access'],
    billingCycle: 'annual',
    badge: 'BEST VALUE',
  },
  {
    id: 'elite-annual',
    name: 'Elite Annual',
    credits: 899,
    price: 999,
    description: '899 credits/year',
    type: 'subscription',
    features: ['899 credits/year', 'Property pulls @ $1.00', 'Agent Vault', 'Workspace', 'Priority support'],
    billingCycle: 'annual',
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();
  const pkgParam = searchParams.get('pkg');
  const initialPkg = packages.find((p) => p.id === pkgParam) || packages[0];

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

      const checkoutUrl = new URL(data.checkout_url);
      checkoutUrl.searchParams.set('checkoutId', data.checkoutId);
      checkoutUrl.searchParams.set('tier', selectedPackage.id);
      checkoutUrl.searchParams.set('userId', user?.uid || '');

      window.location.href = checkoutUrl.toString();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Sign In Required</h1>
          <p className="text-gray-300 mb-8">Please sign in to purchase a plan.</p>
          <Link
            href="/"
            className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] font-bold py-3 px-8 rounded-xl transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div className="fixed inset-0 z-0">
        <img src={BG_URL} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2b4a]/90 via-[#2d4a7c]/85 to-[#1a2b4a]/90" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.back()}
            className="mb-6 text-gray-300 hover:text-[#c9a227] transition font-medium flex items-center gap-2"
          >
            ← Back to Pricing
          </button>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">Complete Your Purchase</h1>
            <p className="text-gray-300 text-lg">Choose your plan and get instant access</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#0f1e35]/60 backdrop-blur-xl border border-[#c9a227]/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Error Alert */}
          {error && (
            <div className="mb-8 bg-red-500/15 border border-red-500/40 text-red-200 p-4 rounded-xl">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-10">
            {/* Plan Selection */}
            <div>
              <label className="block text-white font-bold text-lg mb-6">Select Your Plan</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative p-6 rounded-2xl border-2 transition text-left group ${
                      selectedPackage.id === pkg.id
                        ? 'border-[#c9a227] bg-[#c9a227]/10 shadow-lg shadow-[#c9a227]/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <div className="absolute -top-3 right-4 bg-[#c9a227] text-[#1a2b4a] text-xs font-bold px-3 py-1 rounded-full">
                        {pkg.badge}
                      </div>
                    )}

                    <h3 className="text-white font-bold text-lg mb-1">{pkg.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>

                    {/* Features List */}
                    <ul className="mb-4 space-y-2 text-xs text-gray-300">
                      {pkg.features.slice(0, 2).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#c9a227] mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-between items-end pt-4 border-t border-white/10">
                      <span className="text-gray-300 text-xs">{pkg.credits} credits</span>
                      <span className="text-[#c9a227] font-bold text-xl">${pkg.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-white font-bold mb-3">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/30 transition"
                required
              />
            </div>

            {/* Order Summary */}
            <div className="bg-black/40 border border-[#c9a227]/20 rounded-2xl p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span className="font-medium">{selectedPackage.name} Plan</span>
                  <span>${selectedPackage.price.toFixed(2)}</span>
                </div>
                {selectedPackage.type === 'subscription' && (
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Billing: {selectedPackage.billingCycle}</span>
                    <span>Auto-renews</span>
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-white font-bold">Total Due Today</span>
                <span className="text-[#c9a227] font-bold text-2xl">
                  ${selectedPackage.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c9a227] hover:bg-[#e8c547] disabled:bg-gray-600 text-[#1a2b4a] font-bold py-4 rounded-xl transition text-lg shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>

            {/* Trust Footer */}
            <div className="text-center space-y-3 pt-4 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                💳 Secure payment powered by <span className="font-semibold text-white">Square</span>
              </p>
              <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span>🔒 SSL Encrypted</span>
                <span>✓ PCI Compliant</span>
              </div>
              <p className="text-xs text-gray-500">
                By purchasing, you agree to our{' '}
                <Link href="/terms" className="text-[#c9a227] hover:underline">
                  Terms of Service
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
