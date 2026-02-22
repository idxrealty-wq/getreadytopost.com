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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Our Deals
          </h1>
          <p className="text-xl text-slate-600">
            Choose the plan that works for you
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-12 border-b border-slate-200">
          <button
            onClick={() => setSelectedTab('rewrites')}
            className={`pb-4 px-4 font-semibold transition ${
              selectedTab === 'rewrites'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pay Per Rewrite
          </button>
          <button
            onClick={() => setSelectedTab('vault')}
            className={`pb-4 px-4 font-semibold transition ${
              selectedTab === 'vault'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agent Vault Pro
          </button>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {offers.map((offer, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition border border-slate-200 overflow-hidden flex flex-col"
            >
              {/* Graphic Image (if available) */}
              {offer.image && (
                <div className="relative w-full h-64 bg-slate-100">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* Badge */}
              {offer.badge && !offer.image && (
                <div className="bg-blue-600 text-white text-center py-2 font-bold text-sm">
                  {offer.badge}
                </div>
              )}

              {/* Content */}
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {offer.title}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {offer.price}
                  </span>
                  {offer.period && (
                    <span className="text-slate-600 ml-2">{offer.period}</span>
                  )}
                </div>
                <p className="text-slate-600 mb-6">{offer.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {offer.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">✓</span>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a
                  href={offer.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-center transition"
                >
                  Get Started
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Questions?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">
                What's included in Agent Vault Pro?
              </h3>
              <p className="text-slate-600">
                Unlimited listing rewrites, pre-listing checklists, property research tools, document storage, and more.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-600">
                Monthly plans can be canceled anytime. 6-month and annual plans are non-refundable but lock in the best rates.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">
                Do I need a subscription?
              </h3>
              <p className="text-slate-600">
                No! You can pay per rewrite with our Single or 5-pack options. Agent Vault Pro is optional for unlimited access.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">
                How fast are rewrites?
              </h3>
              <p className="text-slate-600">
                All rewrites are delivered instantly. You get MLS-ready copy, SEO optimization, and professional formatting.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 text-white rounded-lg p-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your listings?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Start with a single rewrite or unlock unlimited access with Agent Vault Pro.
          </p>
          <Link
            href="/rate-my-listing"
            className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-slate-100 transition"
          >
            Try Free Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
