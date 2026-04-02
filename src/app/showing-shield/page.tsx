'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const USE_CASES = [
  {
    icon: '💑',
    title: 'First Dates',
    desc: 'She met him on an app. You don\'t know his name. Now you can watch her location in real time until she\'s home safe.',
  },
  {
    icon: '🚗',
    title: 'Rideshare & Late Nights',
    desc: 'Uber alone at 2am. One shared link and someone who loves her is watching every mile.',
  },
  {
    icon: '🎓',
    title: 'College Campus',
    desc: 'Walking to the car after a late class. Library nights. Parties. Parents sleep better when they can see the pin moving.',
  },
  {
    icon: '🏠',
    title: 'Real Estate Agents',
    desc: 'Showing a vacant property to a stranger. One panic phrase typed in chat triggers a silent alert with evidence photos.',
  },
  {
    icon: '🔧',
    title: 'Contractors & Caregivers',
    desc: 'Working alone in someone else\'s home. A live location shared with your office changes everything.',
  },
  {
    icon: '👵',
    title: 'Elderly Parents',
    desc: 'Living alone. Driving solo. Adult kids can check the map anytime without calling and worrying them.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Set Up in 2 Minutes',
    desc: 'Add up to 3 emergency contacts and choose a silent panic phrase. Share your permanent tracking link.',
  },
  {
    step: '02',
    title: 'They Watch. You Go.',
    desc: 'Your location pings live every 30 seconds. Anyone with your link sees exactly where you are — no login needed.',
  },
  {
    step: '03',
    title: 'Panic Phrase = Instant Alert',
    desc: 'Type your phrase in the chat. It looks like a normal message. Behind the scenes: alert emails, evidence photos, and continuous GPS updates fire immediately.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'My daughter is in college three states away. I have her tracking link bookmarked. I check it every night she goes out. It\'s the only reason I sleep.',
    name: 'Karen M.',
    role: 'Mother of a college sophomore',
  },
  {
    quote: 'I show vacant properties alone twice a week. After a client made me uncomfortable last year, I needed something silent. This is exactly that.',
    name: 'Sandra T.',
    role: 'Licensed Real Estate Agent, Tampa FL',
  },
  {
    quote: 'We set it up for our mom after dad passed. She lives alone and drives herself everywhere. The whole family has her link. She loves that we\'re not calling her every hour.',
    name: 'David R.',
    role: 'Son, caring for an 74-year-old parent',
  },
];

export default function ShowingShieldLanding() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08152b]" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav className="bg-[#08152b]/95 backdrop-blur border-b border-[#c9a227]/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#c9a227] flex items-center justify-center font-bold text-[#08152b] text-sm">
              SS
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Showing Shield</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-400 hover:text-white text-sm transition">How It Works</a>
            <a href="#use-cases" className="text-gray-400 hover:text-white text-sm transition">Who It's For</a>
            <a href="#testimonials" className="text-gray-400 hover:text-white text-sm transition">Stories</a>
            <button
              onClick={() => router.push('/signin')}
              className="bg-[#c9a227] text-[#08152b] font-bold text-sm px-5 py-2 rounded-full hover:bg-[#d4ad2e] transition"
            >
              Get Protected
            </button>
          </div>
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#0d1f3c] border-t border-white/10 px-4 py-4 space-y-4">
            <a href="#how-it-works" className="block text-gray-300 text-sm" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#use-cases" className="block text-gray-300 text-sm" onClick={() => setMenuOpen(false)}>Who It's For</a>
            <a href="#testimonials" className="block text-gray-300 text-sm" onClick={() => setMenuOpen(false)}>Stories</a>
            <button
              onClick={() => router.push('/signin')}
              className="w-full bg-[#c9a227] text-[#08152b] font-bold text-sm px-5 py-3 rounded-full"
            >
              Get Protected
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#08152b] via-[#0d1f3c] to-[#08152b]" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #c9a227 0%, transparent 60%), radial-gradient(circle at 70% 20%, #c9a227 0%, transparent 50%)' }} />
        <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#c9a227] animate-pulse inline-block"></span>
            <span className="text-[#c9a227] text-xs font-semibold tracking-wide uppercase">Silent. Invisible. Always On.</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Your daughter is on<br />
            <span className="text-[#c9a227]">a first date.</span><br />
            You're just waiting.
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Showing Shield gives the people you love a live location link, a silent panic trigger, and instant emergency alerts — without anyone knowing it's running.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/signin')}
              className="bg-[#c9a227] text-[#08152b] font-black text-base px-8 py-4 rounded-full hover:bg-[#d4ad2e] transition shadow-lg shadow-[#c9a227]/20"
            >
              Get Protected Free →
            </button>
            <a
              href="#how-it-works"
              className="border border-white/20 text-white font-semibold text-base px-8 py-4 rounded-full hover:border-white/40 transition"
            >
              See How It Works
            </a>
          </div>
          <p className="text-gray-500 text-xs mt-6">No app download required. Works on any phone browser.</p>
        </div>
      </section>

      {/* Scene image */}
      <section className="relative w-full overflow-hidden" style={{ height: '420px' }}>
        <img
          src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/37104f32-3463-4eee-ab35-0710a2b44068/image.png?w=1184&h=864"
          alt="Safety rescue scene"
          className="w-full h-full object-cover"
          style={{ opacity: 0.38 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08152b] via-transparent to-[#08152b]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-2xl md:text-3xl font-black text-center px-4 drop-shadow-lg">
            Because <span className="text-[#c9a227]">peace of mind</span> is not optional.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0d1f3c] border-y border-[#c9a227]/20 py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { value: '30s', label: 'Location ping interval' },
            { value: '3', label: 'Emergency contacts' },
            { value: '0', label: 'App downloads needed' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-[#c9a227] text-2xl md:text-3xl font-black">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#c9a227] text-xs font-semibold uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Set up once. Protected always.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="bg-[#0d1f3c] rounded-2xl border border-white/10 px-6 py-8 relative">
                <p className="text-[#c9a227]/20 text-6xl font-black absolute top-4 right-6 leading-none">{item.step}</p>
                <p className="text-[#c9a227] text-xs font-semibold uppercase tracking-widest mb-3">{item.step}</p>
                <p className="text-white font-bold text-lg mb-3">{item.title}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="py-20 px-4 bg-[#0d1f3c]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#c9a227] text-xs font-semibold uppercase tracking-widest mb-3">Who It's For</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Anyone who goes somewhere alone.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map((item) => (
              <div key={item.title} className="bg-[#08152b] rounded-2xl border border-white/10 px-6 py-6 hover:border-[#c9a227]/30 transition">
                <p className="text-3xl mb-4">{item.icon}</p>
                <p className="text-white font-bold text-base mb-2">{item.title}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#c9a227] text-xs font-semibold uppercase tracking-widest mb-3">Real Stories</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">The people who needed this most.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#0d1f3c] rounded-2xl border border-white/10 px-6 py-6 flex flex-col">
                <p className="text-[#c9a227] text-2xl mb-4">"</p>
                <p className="text-gray-300 text-sm leading-relaxed flex-1">{t.quote}</p>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-white text-sm font-bold">{t.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#0d1f3c] to-[#08152b] border border-[#c9a227]/30 rounded-3xl px-8 py-14 shadow-2xl">
            <p className="text-[#c9a227] text-xs font-semibold uppercase tracking-widest mb-4">Start Now</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Two minutes of setup.<br />A lifetime of peace of mind.
            </h2>
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              Share your tracking link. Set your panic phrase. The people who love you will always know where you are.
            </p>
            <button
              onClick={() => router.push('/signin')}
              className="bg-[#c9a227] text-[#08152b] font-black text-base px-10 py-4 rounded-full hover:bg-[#d4ad2e] transition shadow-lg shadow-[#c9a227]/20 w-full sm:w-auto"
            >
              Get Protected Free →
            </button>
            <p className="text-gray-600 text-xs mt-4">No app download. No credit card. Works on any phone.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1f3c] border-t border-white/10 px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c9a227] flex items-center justify-center font-bold text-[#08152b] text-xs">
              SS
            </div>
            <span className="text-white font-bold text-sm">Showing Shield</span>
          </div>
          <p className="text-gray-500 text-xs text-center">
            © {new Date().getFullYear()} Showing Shield. A GetReadyToPost product. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-gray-500 hover:text-white text-xs transition">Privacy</a>
            <a href="/terms" className="text-gray-500 hover:text-white text-xs transition">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
