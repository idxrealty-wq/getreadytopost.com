"use client";

import Link from "next/link";
import { useState } from "react";
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

  const { user, profile, loading } = useUser();

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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1a2b4a]">
            GetReadyToPost
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
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

          {/* Auth (desktop) */}
          <div className="hidden md:flex items-center gap-4">
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
            className="md:hidden text-gray-700 text-2xl"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-6 py-4 space-y-2">
              {/* Auth (mobile) */}
              {!loading &&
                (user && profile ? (
                  <div className="flex items-center justify-between py-2">
                    <div className="text-sm font-bold text-gray-800">
                      Welcome, {getFirstName()}!
                    </div>
                    <button
                      onClick={async () => {
                        await handleSignOut();
                        closeMobile();
                      }}
                      className="text-sm font-medium text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 py-2">
                    <button
                      onClick={() => {
                        handleJoin();
                        closeMobile();
                      }}
                      className="flex-1 border border-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                    >
                      Join
                    </button>
                    <button
                      onClick={() => {
                        handleSignIn();
                        closeMobile();
                      }}
                      className="flex-1 bg-[#c9a227] text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Sign In
                    </button>
                  </div>
                ))}

              {/* Nav (mobile) */}
              {navItems.map((item) => (
                <div key={item.label} className="py-1">
                  {"href" in item ? (
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className="block py-2 font-medium text-gray-800"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown((cur) =>
                            cur === item.label ? null : item.label
                          )
                        }
                        className="w-full flex items-center justify-between py-2 font-medium text-gray-800"
                      >
                        {item.label}
                        <span className="text-xs">
                          {openDropdown === item.label ? "▲" : "▼"}
                        </span>
                      </button>
                      {openDropdown === item.label && (
                        <div className="pl-4 pb-2">
                          {item.dropdown.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={closeMobile}
                              className="block py-2 text-gray-700"
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
            </div>
          </div>
        )}
      </header>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
