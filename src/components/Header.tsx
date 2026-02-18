"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import AuthModal from "./AuthModal";
import CompleteProfileModal from "./CompleteProfileModal";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const { user, profile, loading } = useUser();

  useEffect(() => {
    // Check if user is signed in but profile is incomplete
    if (!loading && user && profile) {
      const isIncomplete = !profile.company || !profile.fullName;
      setShowCompleteProfile(isIncomplete);
    }
  }, [user, profile, loading]);

  const handleSignOut = async () => {
    await signOut(auth);
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
            <Link href="/workspace" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              Agent Workspace
            </Link>
            {user && (
              <Link href="/vault" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
                Agent Vault
              </Link>
            )}
            <Link href="/faq" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              FAQ
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              How It Works
            </Link>

            {!loading && (
              user && profile ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      Welcome back, {getFirstName()}! 👋
                    </p>
                    {profile.company && (
                      <p className="text-xs text-gray-600">{profile.company}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-red-600 font-medium transition text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-2 rounded-lg font-bold transition"
                >
                  Sign In
                </button>
              )
            )}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 text-2xl"
          >
            ☰
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="flex flex-col p-6 gap-4">
              <Link href="/" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
                Home
              </Link>
              <Link href="/ai-advantage" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
                Why Our AI
              </Link>
              <Link href="/workspace" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
                Agent Workspace
              </Link>
              {user && (
                <Link href="/vault" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
                  Agent Vault
                </Link>
              )}
              <Link href="/faq" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
                FAQ
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
                How It Works
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
                How It Works
              </Link>

              {!loading && (
                user && profile ? (
                  <>
                    <div className="border-t pt-4">
                      <p className="text-sm font-bold text-gray-800">
                        Welcome, {getFirstName()}! 👋
                      </p>
                      {profile.company && (
                        <p className="text-xs text-gray-600 mt-1">{profile.company}</p>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-left text-gray-700 hover:text-red-600 font-medium transition"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-2 rounded-lg font-bold transition text-center"
                  >
                    Sign In
                  </button>
                )
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      {user && profile && (
        <CompleteProfileModal
          isOpen={showCompleteProfile}
          onClose={() => setShowCompleteProfile(false)}
          userId={user.uid}
          currentName={profile.fullName || user.displayName || ''}
          currentEmail={profile.email}
        />
      )}
    </>
  );
}
