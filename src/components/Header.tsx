"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import AuthModal from "./AuthModal";

type NavLink = { label: string; href: string };
type NavItemWithHref = { label: string; href: string };
type NavItemWithDropdown = { label: string; dropdown: NavLink[] };
type NavItem = NavItemWithHref | NavItemWithDropdown;

export default function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const { user, profile, loading } = useUser();

  useEffect(() => {
    if (user) {
      fetchCreditBalance();
    }
  }, [user]);

  const fetchCreditBalance = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/credits/balance?userId=${user.uid}`);
      const data = await res.json();
      setCreditBalance(data.balance || 0);
    } catch (err) {
      console.error('Failed to fetch credit balance:', err);
    }
  };

  const getFirstName = () => {
    if (!profile?.fullName) return "";
    return profile.fullName.split(" ")[0];
  };

  const handleJoin = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setOpenDropdown(null);
  };

  const navItems: NavItem[] = [
    { label: "Home", href: "/" },
    {
      label: "Product",
      dropdown: [
        { label: "Why Our AI", href: "/ai-advantage" },
        { label: "How It Works", href: "/how-it-works" },
        { label: "Pricing", href: "/pricing" },
        { label: "Our Deals", href: "/our-deals" },
        { label: "Examples", href: "/examples" },
      ],
    },
    {
      label: "For Home Sellers",
      dropdown: [
        { label: "Home Sellers", href: "/home-sellers" },
        { label: "Grade My Listing", href: "/rate-my-listing" },
        { label: "FAQ", href: "/faq" },
        { label: "FSBO", href: "/fsbo" },
        { label: "Get Why Copy Matters", href: "/get-why-copy-matters" },
      ],
    },
    {
      label: "For Agents",
      dropdown: [
        { label: "Workspace", href: "/workspace" },
        { label: "Agent Vault", href: "/agent-vault" },
        { label: "Rate Listing", href: "/rate-my-listing" },
        { label: "Our Deals", href: "/our-deals" },
        { label: "Brokers", href: "/brokers" },
        { label: "Broker Contact Us", href: "/contact-broker" },
      ],
    },
    {
      label: "Resources",
      dropdown: [
        { label: "FAQ", href: "/faq" },
        { label: "Feedback", href: "/feedback" },
        { label: "Our Deals", href: "/our-deals" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#1a2b4a] flex-shrink-0">
            GetReadyToPost
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-12 flex-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {"href" in item ? (
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-[#c9a227] font-medium transition"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className="text-gray-700 hover:text-[#c9a227] font-medium transition flex items-center gap-2"
                    >
                      {item.label}
                      <span className="text-xs">▼</span>
                    </button>
                    <div className="absolute left-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
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
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Credits Pill (centered) */}
          {!loading && user && creditBalance !== null && (
            <Link
              href="/checkout"
              className="hidden md:block whitespace-nowrap bg-[#c9a227]/20 hover:bg-[#c9a227]/30 text-[#c9a227] px-3 py-1.5 rounded-lg font-bold text-xs transition border border-[#c9a227]/40 flex-shrink-0"
            >
              Credits: {creditBalance}
            </Link>
          )}

          {/* Auth (desktop) */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {!loading &&
              (user && profile ? (
                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-gray-800">
                    Welcome, {getFirstName()}! 👋
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-red-600 font-medium transition text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/checkout"
                    className="text-gray-700 hover:text-[#c9a227] font-medium transition text-sm"
                  >
                    Buy Credits
                  </Link>
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
                </>
              ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 text-2xl flex-shrink-0"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 max-h-96 overflow-y-auto">
            <div className="px-8 py-5 space-y-4">
              {navItems.map((item) => (
                <div key={item.label}>
                  {"href" in item ? (
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className="block text-gray-700 hover:text-[#c9a227] font-medium transition py-2"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === item.label ? null : item.label
                          )
                        }
                        className="w-full text-left text-gray-700 hover:text-[#c9a227] font-medium transition py-2 flex items-center justify-between"
                      >
                        {item.label}
                        <span
                          className={`text-xs transition ${
                            openDropdown === item.label ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>
                      {openDropdown === item.label && (
                        <div className="pl-4 space-y-2 border-l border-gray-200">
                          {item.dropdown.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={closeMobile}
                              className="block text-gray-700 hover:text-[#c9a227] transition py-1"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}

              {/* Mobile Auth - Not Logged In */}
              {!loading && !user && (
                <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                  <Link
                    href="/checkout"
                    onClick={closeMobile}
                    className="block text-gray-700 hover:text-[#c9a227] font-medium transition py-2"
                  >
                    Buy Credits
                  </Link>
                  <button
                    onClick={() => {
                      handleJoin();
                      closeMobile();
                    }}
                    className="block w-full text-left text-gray-700 hover:text-[#c9a227] font-medium transition py-2"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => {
                      handleSignIn();
                      closeMobile();
                    }}
                    className="block w-full text-left bg-[#c9a227] hover:bg-[#b8911f] text-white font-bold py-2 px-3 rounded-lg transition"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Mobile Auth - Logged In */}
              {!loading && user && creditBalance !== null && (
                <Link
                  href="/checkout"
                  onClick={closeMobile}
                  className="block text-[#c9a227] font-bold text-sm py-2 border-t border-gray-200 mt-4 pt-4"
                >
                  Credits: {creditBalance}
                </Link>
              )}
              {!loading && user && profile && (
                <button
                  onClick={() => {
                    handleSignOut();
                    closeMobile();
                  }}
                  className="block w-full text-left text-gray-700 hover:text-red-600 font-medium transition py-2 border-t border-gray-200 mt-4 pt-4"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </header>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
}
