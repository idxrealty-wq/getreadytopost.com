'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const PRICING_TIERS = [
  {
    id: 'single',
    name: 'Single Rewrite',
    price: 19.99,
    description: 'Test drive professional copy. One listing instant results. See what better looks like.',
    features: ['Instant Analysis & Rewrite'],
    icon: '📋',
  },
  {
    id: '5pack',
    name: '5 Listing Rewrite Pack',
    price: 85,
    description: 'Upgrade your whole portfolio. Five rewrites at $17 each. Save $17.95 vs. single pricing.',
    features: ['5 rewrites', 'Save $17.95 vs. single pricing'],
    icon: '⭐',
  },
  {
    id: 'monthly',
    name: 'Agent Vault Pro - Monthly',
    price: 99,
    description: 'Try the full workspace risk-free. One month to grade, rewrite, and organize every listing.',
    features: ['3 tier rewrites/month', 'Save up to 15 listings'],
    icon: '🏢',
  },
  {
    id: '6month',
    name: 'Agent Vault Pro - 6 Months',
    price: 495,
    description: 'Serious agents go 6 months. Save $99 vs. monthly. Build a vault of polished listings.',
    features: ['18 free rewrites', 'Save up to 90 listings'],
    icon: '📊',
  },
  {
    id: 'annual',
    name: 'Agent Vault Pro - Annual',
    price: 899,
    description: "The best value. Full year of workspace access. That's $75/month. Professional copy, every listing.",
    features: ['36 FREE REWRITES/YEAR', 'SAVE UP TO 180 LISTINGS'],
    icon: '🏆',
  },
];

export default function OurDealsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleBuyNow = async (packageId: string) => {
    if (!user) {
      router.push('/');
      return;
    }

    setLoading(packageId);

    try {
      const response = await fetch('/api/credits/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          packageType: packageId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.checkout_url) {
        alert('Failed to create checkout. Please try again.');
        setLoading(null);
        return;
      }

      window.location.href = data.checkout_url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Our Deals</h1>
          <p className="text-xl text-gray-300">Choose the plan that works for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="bg-slate-700 rounded-lg overflow-hidden hover:shadow-xl transition-shadow border border-slate-600"
            >
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 text-center">
                <div className="text-4xl mb-2">{tier.icon}</div>
                <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">${tier.price}</div>
                  <p className="text-sm text-gray-300">{tier.description}</p>
                </div>

                <ul className="mb-6 space-y-2">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-200 flex items-start">
                      <span className="text-yellow-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleBuyNow(tier.id)}
                  disabled={loading === tier.id}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 text-slate-900 font-bold py-3 rounded-lg transition"
                >
                  {loading === tier.id ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
