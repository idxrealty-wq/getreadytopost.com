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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1a2b4a]">
            GetReadyToPost
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              Home
            </Link>
            <Link href="/ai-advantage" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              Why Our AI
            </Link>
            <Link href="/home-sellers" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              Home Sellers
            </Link>
            <Link href="/our-deals" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              Our Deals
            </Link>
            <Link href="/faq" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              FAQ
            </Link>
            {!loading && (
              user && profile ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      Welcome, {getFirstName()}! 👋
                    </p>
                  </div>
                  <Link href="/vault" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
                    Agent Vault
                  </Link>
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
          </nav>
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
