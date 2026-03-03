"use client";
import Link from 'next/link';
import { useState } from 'react';

const personas = [
  {
    id: 'agent',
    emoji: '🏠',
    title: 'Real Estate Agent',
    subtitle: 'Turn raw listing notes into polished, MLS-ready copy in minutes',
    color: 'from-blue-600 to-blue-800',
    border: 'border-blue-500/40',
    cta: 'Start as an Agent',
    ctaLink: '/rate-my-listing',
    steps: [
      { number: '01', title: 'Start with Your Listing', description: 'Paste your MLS description or notes. Our AI reads everything — beds, baths, features, neighborhood highlights.', link: '/rate-my-listing', linkText: 'Start with Rate My Listing →', icon: '📋' },
      { number: '02', title: 'Get Your Grade', description: 'Instantly see how your listing scores across 6 categories: Hook, Features, Lifestyle, Compliance, Flow, and Call to Action.', link: '/rate-my-listing', linkText: 'See Rate My Listing →', icon: '📊' },
      { number: '03', title: 'Receive Polished Copy', description: 'Get a fully rewritten, buyer-focused, MLS-compliant description delivered to your inbox. 140–160 words, ready to paste.', link: '/pricing', linkText: 'See Pricing →', icon: '✍️' },
      { number: '04', title: 'Save to Agent Vault', description: 'Every listing you work on is saved in your personal Agent Vault. Edit, view, and manage all your listings in one place.', link: '/agent-vault', linkText: 'Open Agent Vault →', icon: '🗄️' },
    ],
  },
  {
    id: 'broker',
    emoji: '🏢',
    title: 'Broker / Team',
    subtitle: 'Elevate your entire team\'s listing quality with consistent, compliant copy',
    color: 'from-amber-700 to-orange-900',
    border: 'border-amber-400/40',
    cta: 'Explore Broker Plans',
    ctaLink: '/brokers',
    steps: [
      { number: '01', title: 'Set Team Standards', description: 'Establish a consistent voice and quality bar across all agents on your team. No more inconsistent listings.', link: '/brokers', linkText: 'View Broker Program →', icon: '📐' },
      { number: '02', title: 'Bulk Listing Rewrites', description: 'Submit multiple listings at once with our broker program. Prepaid credit tiers with 24-hour SLA turnaround guaranteed.', link: '/brokers', linkText: 'See Broker Pricing →', icon: '📦' },
      { number: '03', title: 'Review & Approve', description: 'Each rewrite comes with a Quality Checklist showing exactly what was improved. One revision included per rewrite.', link: '/examples', linkText: 'See Examples →', icon: '✅' },
      { number: '04', title: 'Deploy Across MLS', description: 'Receive Safe Paste and Pretty versions of every description. Copy-paste ready for Stellar MLS and all major platforms.', link: '/contact-broker', linkText: 'Contact Us →', icon: '🚀' },
    ],
  },
  {
    id: 'fsbo',
    emoji: '👤',
    title: 'For Sale By Owner',
    subtitle: 'Compete with agent listings using professional-grade copy — no agent required',
    color: 'from-green-600 to-green-800',
    border: 'border-green-500/40',
    cta: 'Start FSBO Listing',
    ctaLink: '/fsbo',
    steps: [
      { number: '01', title: 'Describe Your Home', description: 'Tell us about your property in plain language. No real estate experience needed — just describe what makes your home special.', link: '/fsbo', linkText: 'FSBO Guide →', icon: '🏡' },
      { number: '02', title: 'See How You Score', description: 'Run your draft through Rate My Listing to see exactly where buyers will lose interest — and what to fix before you go live.', link: '/rate-my-listing', linkText: 'Rate My Listing →', icon: '📊' },
      { number: '03', title: 'Get a Pro Rewrite', description: 'Our AI rewrites your description to match what buyers are searching for. Buyer-psychology driven, Fair Housing compliant.', link: '/pricing', linkText: 'See Pricing →', icon: '✍️' },
      { number: '04', title: 'Post With Confidence', description: 'Use your polished description on Zillow, Realtor.com, Facebook Marketplace, or any FSBO platform. Stand out instantly.', link: '/examples', linkText: 'See Before & After →', icon: '🎯' },
    ],
  },
  {
    id: 'homeowner',
    emoji: '🏡',
    title: 'Homeowner',
    subtitle: 'Work with your agent to make sure your home tells the right story',
    color: 'from-purple-600 to-purple-800',
    border: 'border-purple-500/40',
    cta: 'Start Pre-Listing',
    ctaLink: '/workspace',
    steps: [
      { number: '01', title: 'Complete Pre-Listing Questionnaire', description: 'Answer simple questions about your home\'s best features, recent upgrades, neighborhood highlights, and lifestyle benefits.', link: '/workspace', linkText: 'Open Workspace →', icon: '📝' },
      { number: '02', title: 'Upload Your Best Photos', description: 'Add photos organized by category — exterior, interior, kitchen, bedrooms, outdoor. Your agent sees everything in one place.', link: '/workspace', linkText: 'Go to Workspace →', icon: '📸' },
      { number: '03', title: 'Share With Your Agent', description: 'Your completed package is saved and ready to share. Your agent gets everything they need to write a winning listing fast.', link: '/workspace', linkText: 'Get Started →', icon: '🤝' },
      { number: '04', title: 'See Your Home Go Live', description: 'With professional copy and great photos, your listing attracts more buyers, more showings, and stronger offers.', link: '/examples', linkText: 'See Real Results →', icon: '🌟' },
    ],
  },
];

export default function HowItWorksPage() {
  const [activePersona, setActivePersona] = useState('agent');
  const current = personas.find(p => p.id === activePersona)!;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-gray-300 mb-6">Your Complete Guide</div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">How to Get the Most Out of<br /><span className="text-[#c9a227]">GetReadyToPost</span></h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Whether you are an agent, broker, FSBO seller, or homeowner — here is exactly how to use every feature to its fullest.</p>
        </div>
      </section>
      <section className="px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-400 mb-6 font-semibold uppercase tracking-widest text-sm">I am a...</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {personas.map(p => (
              <button key={p.id} onClick={() => setActivePersona(p.id)} className={`rounded-2xl p-5 border-2 transition-all text-center ${activePersona === p.id ? `bg-gradient-to-br ${p.color} ${p.border} scale-105 shadow-xl` : 'bg-white/5 border-white/20 hover:bg-white/10'}`}>
                <div className="text-4xl mb-2">{p.emoji}</div>
                <div className="text-white font-bold text-sm">{p.title}</div>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className={`bg-gradient-to-br ${current.color} rounded-3xl p-8 border-2 ${current.border} mb-10`}>
            <div className="text-center mb-10">
              <div className="text-6xl mb-4">{current.emoji}</div>
              <h2 className="text-3xl font-bold text-white mb-3">{current.title}</h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">{current.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {current.steps.map((step, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{step.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white/50 font-bold text-sm">{step.number}</span>
                        <h3 className="text-white font-bold text-lg">{step.title}</h3>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed mb-3">{step.description}</p>
                      <Link href={step.link} className="text-sm font-bold text-white/90 hover:text-white underline underline-offset-2 transition">{step.linkText}</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href={current.ctaLink} className="inline-block bg-white text-gray-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl">{current.cta} →</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-3">Start Here. Level Up When You're Ready.</h2>
          <p className="text-gray-400 text-center mb-10">From rough draft to a client-ready listing package.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: '🏠', title: 'Home', desc: 'Overview of the service and how it works', link: '/' },
              { icon: '📋', 
              { icon: '📊', title: 'Rate My Listing', desc: 'Instantly grade your listing across 6 categories', link: '/rate-my-listing' },
              { icon: '💰', title: 'Pricing', desc: 'Flat $19.99 for a full professional rewrite', link: '/pricing' },
              { icon: '🗄️', title: 'Agent Vault', desc: 'All your saved listings with photos and documents', link: '/agent-vault' },
              { icon: '🔧', title: 'Agent Workspace', desc: 'Full listing builder with checklist, photos, and notes', link: '/workspace' },
              { icon: '🏢', title: 'Brokers', desc: 'Team plans with bulk credits and SLA guarantees', link: '/brokers' },
              { icon: '👤', title: 'FSBO', desc: 'For Sale By Owner listing help and guidance', link: '/fsbo' },
              { icon: '🤖', title: 'Why Our AI', desc: 'How our AI outperforms generic writing tools', link: '/ai-advantage' },
              { icon: '📖', title: 'Examples', desc: 'Real before and after listing rewrites', link: '/examples' },
              { icon: '❓', title: 'FAQ', desc: 'Common questions answered clearly', link: '/faq' },
              { icon: '📞', title: 'Contact', desc: 'Reach out for broker or team inquiries', link: '/contact-broker' },
            ].map((page, i) => (
              <Link key={i} href={page.link} className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-5 transition group">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{page.icon}</div>
                  <div>
                    <div className="text-white font-bold group-hover:text-[#c9a227] transition">{page.title}</div>
                    <div className="text-gray-400 text-sm mt-1">{page.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 text-lg">Pick your path and start creating better listings today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rate-my-listing" className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-4 rounded-xl font-bold text-lg transition">Upload a Listing</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
