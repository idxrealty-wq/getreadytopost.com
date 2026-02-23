"use client";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import AuthModal from "./AuthModal";

export default function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user, profile, loading } = useUser();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleJoin = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const getFirstName = () => {
    if (!profile?.fullName) return '';
    return profile.fullName.split(' ')[0];
  };

  const navItems = [
    { label: 'Home', href: '/', dropdown: null },
    {
      label: 'Product',
      href: null,
      dropdown: [
        { label: 'Why Our AI', href: '/ai-advantage' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Examples', href: '/examples' },
        { label: 'SEO Optimization', href: '/seo-optimization' },
      ],
    },
    {
      label: 'For Home Sellers',
      href: null,
      dropdown: [
        { label: 'Grade My Listing', href: '/rate-my-listing' },
        { label: 'Home Sellers', href: '/home-sellers' },
        { label: 'See Results', href: '/results' },
        { label: 'FSBO', href: '/fsbo' },
        { label: 'Get Why Copy Matters', href: '/get-why-copy-matters' },
      ],
    },
    {
      label: 'For Agents',
      href: null,
      dropdown: [
        { label: 'Agent Vault', href: '/agent-vault' },
        { label: 'Workspace', href: '/workspace' },
        { label: 'Rate Listing', href: '/rate-listing' },
        { label: 'Agents', href: '/agents' },
        { label: 'Brokers', href: '/brokers' },
        { label: 'Contact Broker', href: '/contact-broker' },
      ],
    },
    {
      label: 'Resources',
      href: null,
      dropdown: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Feedback', href: '/feedback' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1a2b4a]">
            GetReadyToPost
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-[#c9a227] font-medium transition"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    className="text-gray-700 hover:text-[#c9a227] font-medium transition flex items-center gap-2"
                  >
                    {item.label}
                    <span className="text-xs">▼</span>
                  </button>
                )}
                {item.dropdown && (
                  <div className="absolute left-0 mt-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                    {item.dropdown.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-gray-700 hover:bg-[#f5f5f5] hover:text-[#c9a227] transition"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {!loading && (
              user && profile ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      Welcome, {getFirstName()}! 👋
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-red-600 font-medium transition text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleJoin}
                    className="text-gray-700 hover:text-[#c9a227] font-medium transition"
                  >
                    Join
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-2 rounded-lg font-bold transition"
                  >
                    Sign In
                  </button>
                </div>
              )
            )}
          </div>
          <button className="md:hidden text-gray-700 text-2xl">☰</button>
        </div>
      </header>
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
        />
      )}
    </>
  );
}
