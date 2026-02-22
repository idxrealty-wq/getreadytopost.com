'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function OurDealsPage() {
  const [selectedTab, setSelectedTab] = useState<'rewrites' | 'vault'>('rewrites');

  const rewriteOffers = [
    {
      title: 'Single Rewrite',
      price: '$19.99',
      period: null,
      description: 'One professional listing rewrite',
      features: ['MLS-ready copy', 'SEO optimization', 'Instant delivery'],
      link: 'https://square.link/u/22tY4Rla',
      badge: null,
      image: null,
    },
    {
      title: '5 Listing Rewrite Pack',
      price: '$85',
      period: null,
      description: 'Save $14.95 on 5 rewrites',
      features: ['MLS-ready copy', 'SEO optimization', 'Instant delivery', 'Best for teams'],
      link: 'https://square.link/u/15NaVu0p',
      badge: 'BEST VALUE',
      image: '/offers/5-pack-rewrite.png',
    },
  ];

  const vaultOffers = [
    {
      title: 'Agent Vault Pro - Monthly',
      price: '$99',
      period: '/month',
      description: 'Full access to Agent Vault tools',
      features: ['Unlimited rewrites', 'Pre-listing checklist', 'Property research', 'Document storage', 'Cancel anytime'],
      link: 'https://square.link/u/PUNuh53u',
      badge: 'MOST POPULAR',
      image: '/offers/agent-vault-pro-monthly.png',
    },
    {
      title: 'Agent Vault Pro - 6 Months',
      price: '$495',
      period: '(6 months)',
      description: 'Save $99 vs monthly',
      features: ['Unlimited rewrites', 'Pre-listing checklist', 'Property research', 'Document storage', 'Lock in rate'],
      link: 'https://square.link/u/8nf73LLz',
      badge: 'BEST VALUE',
      image: '/offers/agent-vault-pro-6-month.png',
    },
    {
      title: 'Agent Vault Pro - Annual',
      price: '$899',
      period: '/year',
      description: 'Best value - save $288 vs monthly',
      features: ['Unlimited rewrites', 'Pre-listing checklist', 'Property research', 'Document storage', 'Priority support'],
      link: 'https://square.link/u/lgsIomQl',
      badge: 'ULTIMATE POWER',
      image: '/offers/agent-vault-pro-annual.png',
    },
  ];

  const offers = selectedTab === 'rewrites' ? rewriteOffers : vaultOffers;

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold text-white mb-4 text-center">
          Our Deals
        </h1>
        <p className="text-gray-300 text-xl text-center mb-12">
          Choose the plan that works for you
        </p>

        <div className="flex gap-8 mb-12 justify-center border-b border-white/20 pb-4">
          <button
            onClick={() => setSelectedTab('rewrites')}
            className={`font-semibold transition pb-2 ${
              selectedTab === 'rewrites'
                ? 'text-[#c9a227] border-b-2 border-[#c9a227]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Pay Per Rewrite
          </button>
          <button
            onClick={() => setSelectedTab('vault')}
            className={`font-semibold transition pb-2 ${
              selectedTab === 'vault'
                ? 'text-[#c9a227] border-b-2 border-[#c9a227]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Agent Vault Pro
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {offers.map((offer, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden flex flex-col hover:bg-white/15 transition"
            >
              {offer.image && (
                <div className="relative w-full h-64 bg-slate-900">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {offer.badge && !offer.image && (
                <div className="bg-[#c9a227] text-white text-center py-2 font-bold text-sm">
                  {offer.badge}
                </div>
              )}

              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {offer.title}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-[#c9a227]">
                    {offer.price}
                  </span>
                  {offer.period && (
                    <span className="text-gray-300 ml-2">{offer.period}</span>
                  )}
                </div>
                <p className="text-gray-300 mb-6">{offer.description}</p>

                <ul className="space-y-3 mb-8 flex-grow">
                  {offer.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3">
                      <span className="text-[#c9a227] font-bold mt-1">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={offer.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#c9a227] hover:bg-[#b8911f] text-white font-bold py-3 px-4 rounded-xl text-center transition"
                >
                  Get Started
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Questions?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-white mb-2">
                What's included in Agent Vault Pro?
              </h3>
              <p className="text-gray-300">
                Unlimited listing rewrites, pre-listing checklists, property research tools, document storage, and more.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-300">
                Monthly plans can be canceled anytime. 6-month and annual plans are non-refundable but lock in the best rates.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">
                Do I need a subscription?
              </h3>
              <p className="text-gray-300">
                No! You can pay per rewrite with our Single or 5-pack options. Agent Vault Pro is optional for unlimited access.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">
                How fast are rewrites?
              </h3>
              <p className="text-gray-300">
                All rewrites are delivered instantly. You get MLS-ready copy, SEO optimization, and professional formatting.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your listings?
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            Start with a single rewrite or unlock unlimited access with Agent Vault Pro.
          </p>
          <Link
            href="/rate-my-listing"
            className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white font-bold py-3 px-8 rounded-xl transition"
          >
            Try Free Analysis
          </Link>
        </div>
      </div>
    </main>
  );
}
