"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Rate My Listing', href: '/rate-my-listing', highlight: true },
    { label: 'Agents', href: '/agents' },
    { label: 'Brokers', href: '/brokers' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full"></div>
          <span className="text-[#1a2b4a] font-bold text-xl hidden sm:inline">GetReadyToPost</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={link.highlight 
                ? "text-pink-600 hover:text-pink-700 text-sm font-semibold transition flex items-center gap-1"
                : "text-gray-700 hover:text-[#1a2b4a] text-sm font-medium transition"
              }
            >
              {link.highlight && <span className="text-lg">🔥</span>}
              {link.label}
            </Link>
          ))}
          <Link href="/rate-my-listing" className="bg-[#c9a227] hover:bg-[#e8c547] text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
            Submit Listing
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-[#1a2b4a]">
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
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setMenuOpen(false)} 
              className={link.highlight
                ? "block text-pink-600 font-semibold text-sm py-2"
                : "block text-gray-700 hover:text-[#1a2b4a] text-sm font-medium py-2"
              }
            >
              {link.highlight && "🔥 "}{link.label}
            </Link>
          ))}
          <Link href="/rate-my-listing" onClick={() => setMenuOpen(false)} className="block bg-[#c9a227] hover:bg-[#e8c547] text-white px-5 py-3 rounded-lg text-sm font-semibold text-center mt-2">
            Submit Listing
          </Link>
        </div>
      )}
    </header>
  );
}
