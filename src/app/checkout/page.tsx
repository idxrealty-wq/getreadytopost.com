'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';

const BG_URL = 'https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/e2af6091-9b63-4698-8f57-f02cfe21cfc7/image.png?w=1200&h=896';

type Package = {
  id: string;
  name: string;
  credits: number | null;
  price: number | null;
  description: string;
  type: 'one-time' | 'subscription';
  features: string[];
  billingCycle?: string;
  badge?: string;
  isCredits?: boolean;
};

const packages: Package[] = [
  {
    id: 'credit',
    name: 'Buy Credits',
    credits: null,
    price: null,
    description: 'Purchase any amount of credits',
    type: 'one-time',
    features: ['$1 per credit', 'Use for rewrites, pulls & more', 'Never expires'],
    isCredits: true,
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
  {
    id: 'vault-only',
    name: 'Vault Only',
    credits: 0,
    price: 49.95,
    description: 'Agent Vault access',
    type: 'subscription',
    features: ['Agent Vault only', 'Save & organize', 'No credits included', 'Annual renewal'],
    billingCycle: 'annual',
  },
  {
    id: 'fsbo-launch',
    name: 'FSBO Launch',
    credits: 100,
    price: 100,
    description: '100 credits + workspace',
    type: 'one-time',
    features: ['100 credits', 'Listing rewrites', 'Workspace access', 'Vault access'],
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();

  useEffect(() => {
    console.log('[Checkout] User state:', { user: user?.uid, email: user?.email, loading: authLoading });
  }, [user, authLoading]);

  const pkgParam = searchParams.get('pkg');
  const initialPkg = packages.find((p) => p.id === pkgParam) || packages[0];

  const [selectedPackage, setSelectedPackage] = useState<Package>(initialPkg);
  const [creditQty, setCreditQty] = useState<number>(20);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const getPrice = (): number => {
    if (selectedPackage.isCredits) return creditQty;
    return selectedPackage.price ?? 0;
  };

  const getCredits = (): number => {
    if (selectedPackage.isCredits) return creditQty;
    return selectedPackage.credits ?? 0;
  };

  const handleQtyChange = (val: string) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 1) { setCreditQty(1); return; }
    if (n > 250) { setCreditQty(250); return; }
    setCreditQty(n);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (selectedPackage.isCredits && (creditQty < 1 || creditQty > 250)) {
      setError('Please enter a credit amount between 1 and 250');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const body: Record<string, unknown> = {
        packageType: selectedPackage.id,
        email,
        userId: user?.uid,
      };

      if (selectedPackage.isCredits) {
        body.quantity = creditQty;
      }

      const res = await fetch('/api/credits/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create checkout');
        return;
      }

      // Store checkout metadata for success page retrieval
      localStorage.setItem('checkoutId', data.checkoutId || '');
      localStorage.setItem('checkoutPackageType', selectedPackage.id);
      localStorage.setItem('checkoutUserId', user?.uid || '');

      // Redirect directly to Square's hosted checkout URL (unmodified)
      window.location.href = data.checkout_url;
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
    <div className="min-h-screen relative pt-28 px-4 pb-8 md:px-8">
      <div className="fixed inset-0 z-0">
        <img src={BG_URL} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2b4a]/90 via-[#2d4a7c]/85 to-[#1a2b4a]/90" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
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

        <div className="bg-[#0f1e35]/60 backdrop-blur-xl border border-[#c9a227]/20 rounded-3xl p-8 md:p-12 shadow-2xl">
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
                    {pkg.badge && (
                      <div className="absolute -top-3 right-4 bg-[#c9a227] text-[#1a2b4a] text-xs font-bold px-3 py-1 rounded-full">
                        {pkg.badge}
                      </div>
                    )}
                    <h3 className="text-white font-bold text-lg mb-1">{pkg.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
                    <ul className="mb-4 space-y-2 text-xs text-gray-300">
                      {pkg.features.slice(0, 2).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#c9a227] mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-end pt-4 border-t border-white/10">
                      <span className="text-gray-300 text-xs">
                        {pkg.isCredits ? 'You choose' : `${pkg.credits} credits`}
                      </span>
                      <span className="text-[#c9a227] font-bold text-xl">
                        {pkg.isCredits ? '$1/credit' : `$${pkg.price}`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Credit Quantity Selector — only shown when Buy Credits is selected */}
            {selectedPackage.isCredits && (
              <div>
                <label className="block text-white font-bold mb-3">
                  How many credits? <span className="text-gray-400 font-normal text-sm">(1–250)</span>
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(String(creditQty - 1))}
                    className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xl transition flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={250}
                    value={creditQty}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    className="w-32 text-center bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleQtyChange(String(creditQty + 1))}
                    className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xl transition flex items-center justify-center"
                  >
                    +
                  </button>
                  <span className="text-gray-300 text-sm">
                    = <span className="text-[#c9a227] font-bold text-lg">${creditQty}.00</span>
                  </span>
                </div>
              </div>
            )}

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
                  <span className="font-medium">
                    {selectedPackage.isCredits
                      ? `${creditQty} Credits`
                      : `${selectedPackage.name} Plan`}
                  </span>
                  <span>${getPrice().toFixed(2)}</span>
                </div>
                {selectedPackage.type === 'subscription' && (
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Billing: {selectedPackage.billingCycle}</span>
                    <span>Auto-renews</span>
                  </div>
                )}
                {selectedPackage.isCredits && (
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>{creditQty} credits @ $1.00 each</span>
                    <span>Never expires</span>
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-white font-bold">Total Due Today</span>
                <span className="text-[#c9a227] font-bold text-2xl">
                  ${getPrice().toFixed(2)}
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
