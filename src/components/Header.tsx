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
  const [buyingCredits, setBuyingCredits] = useState(false);

  const { user, profile, loading } = useUser();

  useEffect(() => {
    if (user) {
      fetchCreditBalance();
    } else {
      setCreditBalance(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCreditBalance = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/credits/balance?userId=${user.uid}`);
      const data = await res.json();
      setCreditBalance(data.balance || 0);
    } catch (err) {
      console.error("Failed to fetch credit balance:", err);
    }
  };

  const handleBuyMoreCredits = async () => {
    if (!user) {
      setAuthMode("signin");
      setShowAuthModal(true);
      return;
    }

    try {
      setBuyingCredits(true);

      // Default to 1 credit. You can upgrade this later to a modal quantity picker.
      const res = await fetch("/api/credits/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, packageType: "credit", quantity: 1 }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("Create checkout failed:", json);
        alert(json?.error || "Could not start checkout.");
        return;
      }

      const url = json.checkout_url;
      if (!url) {
        alert("No checkout URL returned.");
        return;
      }

      window.location.href = url;
    } catch (e) {
      console.error("Buy credits error:", e);
      alert("Could not start checkout.");
    } finally {
      setBuyingCredits(false);
    }
  };

  const getFirstName = () => {
    if (!profile?.fullName) return "User";
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
        { label: "Closing Costs Calculator", href: "/closing-costs" },
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
        { label: "Brokers", href: "/brokers" },
        { label: "Broker Contact Us", href: "/contact-broker" },
      ],
    },
    {
      label: "Resources",
      dropdown: [
        { label: "FAQ", href: "/faq" },
        { label: "Closing Costs Calculator", href: "/closing-costs" },
        { label: "Feedback", href: "/feedback" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between gap-6">
          <Link href="/" className="text-2xl font-bold text-[#1a2b4a] flex-shrink-0">
            GetReadyToPost
          </Link>

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
                      <span className="text-xs">v</span>
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

          {!loading && user && creditBalance !== null && (
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <Link
                href="/checkout"
                className="whitespace-nowrap bg-[#c9a227]/20 hover:bg-[#c9a227]/30 text-[#c9a227] px-3 py-1.5 rounded-lg font-bold text-xs transition border border-[#c9a227]/40"
              >
                Credits: {creditBalance}
              </Link>
              <button
                onClick={handleBuyMoreCredits}
                disabled={buyingCredits}
                className="whitespace-nowrap bg-[#c9a227] hover:bg-[#b8911f] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition disabled:opacity-50"
              >
                {buyingCredits ? "Loading..." : "Buy More"}
              </button>
            </div>
          )}

          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {!loading &&
              (user ? (
                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-gray-800">Welcome, {getFirstName()}!</p>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-red-600 font-medium transition text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleBuyMoreCredits}
                    className="text-gray-700 hover:text-[#c9a227] font-medium transition text-sm"
                  >
                    Buy Credits
                  </button>
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

          <button
            className="md:hidden text-gray-700 text-2xl flex-shrink-0"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 max-h-96 overflow-y-auto">
            <div className="px-8 py-5 space-y-4">
              {!loading && user && (
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <p className="text-base font-bold text-gray-900">Welcome, {getFirstName()}!</p>
                  <div className="flex items-center justify-between gap-3 mt-3">
                    {creditBalance !== null && (
                      <div className="flex items-center gap-2">
                        <Link
                          href="/checkout"
                          onClick={closeMobile}
                          className="whitespace-nowrap bg-[#c9a227]/20 text-[#c9a227] px-3 py-1.5 rounded-lg font-bold text-xs border border-[#c9a227]/40"
                        >
                          Credits: {creditBalance}
                        </Link>
                        <button
                          onClick={() => {
                            closeMobile();
                            handleBuyMoreCredits();
                          }}
                          disabled={buyingCredits}
                          className="whitespace-nowrap bg-[#c9a227] hover:bg-[#b8911f] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition disabled:opacity-50"
                        >
                          {buyingCredits ? "Loading..." : "Buy More"}
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        closeMobile();
                      }}
                      className="text-sm font-bold text-red-600 hover:text-red-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

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
                        onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                        className="w-full text-left text-gray-700 hover:text-[#c9a227] font-medium transition py-2 flex items-center justify-between"
                      >
                        {item.label}
                        <span className={`text-xs transition ${openDropdown === item.label ? "rotate-180" : ""}`}>
                          v
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

              {!loading && !user && (
                <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                  <button
                    onClick={() => {
                      handleBuyMoreCredits();
                      closeMobile();
                    }}
                    className="block w-full text-left text-gray-700 hover:text-[#c9a227] font-medium transition py-2"
                  >
                    Buy Credits
                  </button>
                  <button
                    onClick={() => {
                      handleJoin();
                      closeMobile();
                    }}
                    className="block w-full text-left text-gray-700 hover:text-[#c9a227] font-medium transition py-2"
                  >
                    Join
                  </button>
                  <Link
                    href="/signin"
                    onClick={closeMobile}
                    className="block w-full text-center bg-[#c9a227] hover:bg-[#b8911f] text-white font-bold py-2 px-3 rounded-lg transition"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode={authMode} />
    </>
  );
}
