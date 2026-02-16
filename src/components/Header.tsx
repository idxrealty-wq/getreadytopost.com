"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Agents', href: '/agents' },
    { label: 'Brokers', href: '/brokers' },
    { label: 'FSBO', href: '/fsbo' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Examples', href: '/examples' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a2b4a]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="text-white font-bold text-xl">
          GetReady<span className="text-[#c9a227]">ToPost</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-white/80 hover:text-[#c9a227] text-sm font-medium transition">
              {link.label}
            </Link>
          ))}
          <Link href="/upload" className="bg-[#c9a227] hover:bg-[#e8c547] text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
            Submit Listing
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a2b4a] border-t border-white/10 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block text-white/80 hover:text-[#c9a227] text-sm font-medium py-2">
              {link.label}
            </Link>
          ))}
          <Link href="/upload" onClick={() => setMenuOpen(false)} className="block bg-[#c9a227] hover:bg-[#e8c547] text-white px-5 py-3 rounded-lg text-sm font-semibold text-center mt-2">
            Submit Listing
          </Link>
        </div>
      )}
    </header>
  );
}
