"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1a2b4a]">
            GetReadyToPost
          </Link>

          {/* Desktop Navigation */}
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
            <Link href="/faq" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              FAQ
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">👤 {user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-red-600 font-medium transition"
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
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
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
              <Link href="/faq" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
                FAQ
              </Link>
              
              {user ? (
                <>
                  <span className="text-sm text-gray-600">👤 {user.email}</span>
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
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Sign In to GetReadyToPost</h2>
            <p className="text-gray-600 mb-6">Create a free account or sign in to save your listings and access all features.</p>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition">
                Sign In with Google
              </button>
              <button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-bold transition">
                Sign In with Email
              </button>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full mt-4 text-gray-600 hover:text-gray-800 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
